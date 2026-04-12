"""
Spring Boot Dependency Graph Generator for FAST BUY WAVE.

Scans ALL packages under src/main/java and generates a Mermaid diagram
showing dependencies between all classes, including JPA relationships.

JPA rules:
- @ManyToOne -> unidirectional arrow A --> B
- @OneToMany without mappedBy -> unidirectional arrow A --> B
- @OneToMany with mappedBy -> skip (inverse side, avoid duplicates)
- @ManyToMany without mappedBy -> arrow A --> B
- @ManyToMany with mappedBy -> skip (inverse side)
- @OneToOne without mappedBy -> arrow A --> B
- @OneToOne with mappedBy -> skip

Usage:
    python generate_spring_graph.py

Output:
    graphs/spring-graph.md
"""

import re
from pathlib import Path

ROOT = Path(r"C:\Users\popam\Desktop\FastBuyWaveDocker\springboot_be\src\main\java")
OUT_DIR = Path(r"C:\Users\popam\Desktop\FastBuyWaveDocker\springboot_be\graphs")
OUT_DIR.mkdir(parents=True, exist_ok=True)


def classify(java_file, class_name, annotations, content):
    path_str = str(java_file).replace("\\", "/").lower()

    if "@RestController" in annotations or "@Controller" in annotations:
        return "controller"
    if "@Repository" in annotations or class_name.endswith("Repository"):
        return "repository"
    if "@Configuration" in annotations:
        return "config"
    if re.search(r'\benum\s+' + re.escape(class_name), content):
        return "enum"

    if "/controllers/" in path_str:
        return "controller"
    if "/services_impl/" in path_str or class_name.endswith("ServiceImpl"):
        return "service_impl"
    if "/services/" in path_str and not class_name.endswith("ServiceImpl"):
        return "service"
    if "/repositories/" in path_str:
        return "repository"
    if "/entities/" in path_str:
        return "entity"
    if "/enums/" in path_str:
        return "enum"
    if "/dtos/" in path_str or "/dettails/" in path_str or "/criteria/" in path_str or "/support/" in path_str:
        return "dto"
    if "/mappers/" in path_str or class_name.endswith("Mapper"):
        return "mapper"
    if "/config/" in path_str:
        return "config"
    if "/utils/" in path_str:
        return "util"
    if "/exceptions/" in path_str or class_name.endswith("Exception"):
        return "exception"
    if "/interceptor/" in path_str:
        return "interceptor"

    return "other"


def safe_id(name):
    return re.sub(r'[^a-zA-Z0-9_]', '_', name)


SKIP_TYPES = {
    "String", "Long", "Integer", "Boolean", "Double", "Float", "Object",
    "List", "Set", "Map", "Optional", "Page", "Collection", "Iterable",
    "void", "int", "long", "boolean", "double", "float", "char", "byte",
    "Override", "Autowired", "Inject", "Bean", "Component", "Service",
    "Serializable", "Exception", "RuntimeException", "Number",
    "LocalDate", "LocalDateTime", "ZonedDateTime", "Date", "Instant",
    "UUID", "BigDecimal", "Class", "Enum", "Pageable", "Sort",
    "HttpServletRequest", "HttpServletResponse", "ResponseEntity",
    "MultipartFile", "Authentication", "Principal",
}


def extract_jpa_relations(class_name, content):
    """
    Extract JPA relationships from entity fields.
    Only adds arrow for owning side (no mappedBy).
    Returns list of (from_class, to_class, relation_type).
    """
    relations = []

    field_pattern = re.finditer(
        r'(@(?:ManyToOne|OneToMany|ManyToMany|OneToOne)(?:\([^)]*\))?)\s+'
        r'(?:@\w+(?:\([^)]*\))?\s+)*'
        r'(?:private|protected)\s+(?:final\s+)?'
        r'(?:List|Set|Collection|Optional)?<?(\w+)>?\s+\w+',
        content
    )

    for match in field_pattern:
        annotation_full = match.group(1)
        target_type = match.group(2)

        if target_type in {"List", "Set", "Collection", "Optional"}:
            continue

        has_mapped_by = "mappedBy" in annotation_full
        if has_mapped_by:
            continue

        if "@ManyToOne" in annotation_full:
            rel_type = "ManyToOne"
        elif "@OneToMany" in annotation_full:
            rel_type = "OneToMany"
        elif "@ManyToMany" in annotation_full:
            rel_type = "ManyToMany"
        elif "@OneToOne" in annotation_full:
            rel_type = "OneToOne"
        else:
            continue

        if target_type not in SKIP_TYPES and len(target_type) > 2:
            relations.append((class_name, target_type, rel_type))

    return relations


def extract_deps(class_name, content):
    deps = set()

    for m in re.finditer(
        r'(?:private|protected)\s+(?:final\s+)?(\w+)\s+\w+\s*[;=,)]',
        content
    ):
        deps.add(m.group(1))

    for m in re.finditer(
        r'(?:public|protected)\s+' + re.escape(class_name) + r'\s*\(([^)]*)\)',
        content
    ):
        for t in re.findall(r'(\w+)\s+\w+', m.group(1)):
            deps.add(t)

    m = re.search(r'\bimplements\s+([\w,\s<>]+?)(?:\{)', content)
    if m:
        for t in re.findall(r'\b([A-Z]\w+)\b', m.group(1)):
            deps.add(t)

    m = re.search(r'\bextends\s+(\w+)', content)
    if m:
        deps.add(m.group(1))

    for m in re.finditer(r'(?:List|Optional|Page|Set|Collection)<(\w+)>', content):
        deps.add(m.group(1))

    for m in re.finditer(r'(?:public|private|protected)\s+(\w+)\s+\w+\s*\(', content):
        deps.add(m.group(1))

    deps.discard(class_name)
    deps -= SKIP_TYPES
    deps = {d for d in deps if len(d) > 2 and d[0].isupper()}

    return deps


def scan():
    nodes = {}
    edges = []
    jpa_edges = []

    for java_file in ROOT.rglob("*.java"):
        content = java_file.read_text(encoding="utf-8", errors="ignore")

        m = re.search(
            r'(?:public\s+)?(?:abstract\s+)?(?:class|interface|enum)\s+(\w+)',
            content
        )
        if not m:
            continue
        class_name = m.group(1)

        annotations = ["@" + a for a in re.findall(r'@(\w+)', content[:1000])]
        node_type = classify(java_file, class_name, annotations, content)
        nodes[class_name] = {"type": node_type, "safe": safe_id(class_name)}

        for dep in extract_deps(class_name, content):
            edges.append((class_name, dep))

        if node_type == "entity":
            for rel in extract_jpa_relations(class_name, content):
                jpa_edges.append(rel)

    return nodes, edges, jpa_edges


def generate_mermaid(nodes, edges, jpa_edges):
    lines = ["```mermaid", "graph TD", ""]

    type_order = [
        ("controller",   "%% -- Controllers --"),
        ("service",      "%% -- Services (interfaces) --"),
        ("service_impl", "%% -- Service Implementations --"),
        ("repository",   "%% -- Repositories --"),
        ("entity",       "%% -- Entities --"),
        ("enum",         "%% -- Enums --"),
        ("dto",          "%% -- DTOs --"),
        ("mapper",       "%% -- Mappers --"),
        ("config",       "%% -- Config --"),
        ("util",         "%% -- Utils --"),
        ("exception",    "%% -- Exceptions --"),
        ("interceptor",  "%% -- Interceptors --"),
        ("other",        "%% -- Other --"),
    ]

    for node_type, comment in type_order:
        group = {n: i for n, i in nodes.items() if i["type"] == node_type}
        if not group:
            continue
        lines.append(comment)
        for name, info in sorted(group.items()):
            lines.append(f'{info["safe"]}["{name}"]:::{node_type}')
        lines.append("")

    lines.append("%% -- Dependencies --")
    seen = set()
    for from_class, to_class in sorted(edges):
        if from_class not in nodes or to_class not in nodes:
            continue
        key = (from_class, to_class)
        if key in seen:
            continue
        seen.add(key)
        lines.append(f'{nodes[from_class]["safe"]} --> {nodes[to_class]["safe"]}')

    lines.append("")
    lines.append("%% -- JPA Relationships --")
    seen_jpa = set()
    for from_class, to_class, rel_type in sorted(jpa_edges):
        if from_class not in nodes or to_class not in nodes:
            continue
        key = (from_class, to_class, rel_type)
        if key in seen_jpa:
            continue
        seen_jpa.add(key)
        lines.append(f'{nodes[from_class]["safe"]} -->|"{rel_type}"| {nodes[to_class]["safe"]}')

    lines.append("")
    lines.append("classDef controller   fill:#1f77b4,stroke:#0d47a1,stroke-width:2px,color:#fff")
    lines.append("classDef service      fill:#2ca02c,stroke:#1b5e20,stroke-width:2px,color:#fff")
    lines.append("classDef service_impl fill:#98df8a,stroke:#2ca02c,stroke-width:1px,color:#1b5e20")
    lines.append("classDef repository   fill:#ff7f0e,stroke:#e65100,stroke-width:2px,color:#fff")
    lines.append("classDef entity       fill:#9467bd,stroke:#6a1b9a,stroke-width:2px,color:#fff")
    lines.append("classDef enum         fill:#e377c2,stroke:#880e4f,stroke-width:1px,color:#fff")
    lines.append("classDef dto          fill:#7f7f7f,stroke:#424242,stroke-width:1px,color:#fff")
    lines.append("classDef mapper       fill:#bcbd22,stroke:#827717,stroke-width:1px,color:#fff")
    lines.append("classDef config       fill:#17becf,stroke:#006064,stroke-width:1px,color:#fff")
    lines.append("classDef util         fill:#aec7e8,stroke:#1565c0,stroke-width:1px,color:#000")
    lines.append("classDef exception    fill:#d62728,stroke:#b71c1c,stroke-width:1px,color:#fff")
    lines.append("classDef interceptor  fill:#f7b6d2,stroke:#880e4f,stroke-width:1px,color:#000")
    lines.append("classDef other        fill:#c7c7c7,stroke:#616161,stroke-width:1px,color:#000")
    lines.append("```")

    return "\n".join(lines)


def main():
    print("Scanning Spring Boot source...")
    nodes, edges, jpa_edges = scan()

    print(f"\nFound {len(nodes)} classes:")
    for t in ["controller", "service", "service_impl", "repository", "entity",
              "enum", "dto", "mapper", "config", "util", "exception", "interceptor", "other"]:
        count = sum(1 for n in nodes.values() if n["type"] == t)
        if count:
            print(f"  {t:15s}: {count}")

    valid_edges = [(f, t) for f, t in edges if f in nodes and t in nodes]
    valid_jpa = [(f, t, r) for f, t, r in jpa_edges if f in nodes and t in nodes]
    print(f"\nFound {len(valid_edges)} dependency edges")
    print(f"Found {len(valid_jpa)} JPA relationship edges")

    mermaid = generate_mermaid(nodes, edges, jpa_edges)

    out_file = OUT_DIR / "spring-graph.md"
    out_file.write_text(mermaid, encoding="utf-8")
    print(f"\nDone. Graph saved to: {out_file}")


if __name__ == "__main__":
    main()