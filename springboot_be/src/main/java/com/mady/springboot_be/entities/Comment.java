package com.mady.springboot_be.entities;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

@NamedQuery(name = "Comment.findRootCommentsByAdvertisementId", query = "SELECT c FROM Comment c WHERE c.advertisement.id = :advertisementId AND c.parent IS NULL AND c.active = true ORDER BY c.createdAt ASC")

@NamedQuery(name = "Comment.findAllInThread", query = "SELECT c FROM Comment c WHERE c.advertisement.id = :advertisementId AND "
        +
        "(c.id = :rootId OR c.treePath LIKE CONCAT(:rootId, '.%') OR c.treePath LIKE CONCAT('%.', :rootId, '.%')) " +
        "AND c.active = true ORDER BY c.treePath, c.createdAt ASC")

@NamedQuery(name = "Comment.findDirectChildren", query = "SELECT c FROM Comment c WHERE c.parent.id = :parentId AND c.active = true ORDER BY c.createdAt ASC")

@NamedQuery(name = "Comment.countByAdvertisementId", query = "SELECT COUNT(c) FROM Comment c WHERE c.advertisement.id = :advertisementId AND c.active = true")

@NamedQuery(name = "Comment.findByAdvertisementIdAndMaxDepth", query = "SELECT c FROM Comment c WHERE c.advertisement.id = :advertisementId AND c.depthLevel <= :maxDepth AND c.active = true ORDER BY c.treePath, c.createdAt ASC")

@NamedQuery(name = "Comment.findByAdvertisementIdAndParentIsNull", query = "SELECT DISTINCT c FROM Comment c LEFT JOIN FETCH c.children WHERE c.advertisement.advertisementId = :advertisementId AND c.parent IS NULL AND c.active = true")

@NamedQuery(name = "Comment.findByIdWithChildren", query = "SELECT c FROM Comment c LEFT JOIN FETCH c.children WHERE c.id = :id")

@NamedQuery(name = "Comment.findByAdvertisementIdOrderByTreePathCreatedAt", query = "SELECT c FROM Comment c LEFT JOIN FETCH c.children WHERE c.advertisement.id = :advertisementId AND c.active = true ORDER BY c.treePath, c.createdAt ASC")

@Entity
@Table(name = "comments")
public class Comment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "advertisement_id", nullable = false)
    private Advertisement advertisement;

    // Riferimento al commento padre (null per commenti di primo livello)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    private Comment parent;

    // Lista dei commenti figli
    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @OrderBy("createdAt ASC")
    private List<Comment> children = new ArrayList<>();

    @Column(nullable = false, length = 244)
    private String content;

    // Livello di profondità (0 = commento principale, 1 = prima risposta, ecc.)
    @Column(name = "depth_level", nullable = false)
    private Integer depthLevel = 0;

    // Path per ottimizzare le query (es: "1.5.12" per il commento 12 figlio di 5
    // figlio di 1)
    @Column(name = "tree_path", length = 500)
    private String treePath;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @Column(name = "active", nullable = false)
    private boolean active = true;

    // Contatore cache per le risposte totali (incluse quelle annidate)
    @Column(name = "total_replies_count")
    private Integer totalRepliesCount = 0;

    // Contatore per le risposte dirette
    @Column(name = "direct_replies_count")
    private Integer directRepliesCount = 0;

    // Costruttori
    public Comment() {
        this.createdAt = LocalDateTime.now();
    }

    public Comment(User user, Advertisement advertisement, String content) {
        this();
        this.user = user;
        this.advertisement = advertisement;
        this.content = content;
    }

    public Comment(User user, Advertisement advertisement, String content, Comment parent) {
        this(user, advertisement, content);
        this.parent = parent;
    }

    // Metodi di utilità
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    // Metodo per aggiungere una risposta
    public void addChild(Comment child) {
    if (child == null) return;

    // Evita duplicati nella lista figli
    if (!children.contains(child)) {
        children.add(child);
    }

    // Evita override se il parent è già settato correttamente
    if (child.getParent() == null || !child.getParent().equals(this)) {
        child.setParent(this);
    }

    // Imposta profondità solo se non è già corretta
    int expectedDepth = this.depthLevel + 1;
    if (child.getDepthLevel() == null || !child.getDepthLevel().equals(expectedDepth)) {
        child.setDepthLevel(expectedDepth);
    }

    // Imposta treePath solo se non già corretto
    String expectedPrefix = (this.treePath == null || this.treePath.isEmpty()) ? this.id.toString() : this.treePath + "." + this.id;
    if (child.getTreePath() == null || !child.getTreePath().startsWith(expectedPrefix)) {
        String newTreePath = expectedPrefix + "." + (child.getId() != null ? child.getId() : "TEMP");
        child.setTreePath(newTreePath);
    }

    // Aggiorna contatori solo se necessario (cioè se il figlio è effettivamente nuovo)
    if (!children.contains(child)) {
        this.directRepliesCount++;
        Comment currentParent = this;
        while (currentParent != null) {
            currentParent.totalRepliesCount++;
            currentParent = currentParent.getParent();
        }
    }
}

    // Metodo per rimuovere una risposta
    public void removeChild(Comment child) {
        children.remove(child);
        child.setParent(null);

        // Aggiorna i contatori
        this.directRepliesCount--;

        // Calcola il numero totale di commenti rimossi (inclusi i figli)
        int removedCount = calculateTotalDescendants(child) + 1;

        // Aggiorna il contatore totale per tutti i genitori
        Comment currentParent = this;
        while (currentParent != null) {
            currentParent.totalRepliesCount -= removedCount;
            currentParent = currentParent.getParent();
        }
    }

    // Calcola il numero totale di discendenti
    private int calculateTotalDescendants(Comment comment) {
        int count = 0;
        for (Comment child : comment.getChildren()) {
            count += 1 + calculateTotalDescendants(child);
        }
        return count;
    }

    // Verifica se è un commento di primo livello
    public boolean isRootComment() {
        return parent == null;
    }

    // Ottieni il commento radice
    public Comment getRootComment() {
        Comment root = this;
        while (root.getParent() != null) {
            root = root.getParent();
        }
        return root;
    }

    // Ottieni tutti i discendenti in ordine di profondità
    public List<Comment> getAllDescendants() {
        List<Comment> descendants = new ArrayList<>();
        for (Comment child : children) {
            descendants.add(child);
            descendants.addAll(child.getAllDescendants());
        }
        return descendants;
    }

    // Getter e Setter
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Advertisement getAdvertisement() {
        return advertisement;
    }

    public void setAdvertisement(Advertisement advertisement) {
        this.advertisement = advertisement;
    }

    public Comment getParent() {
        return parent;
    }

    public void setParent(Comment parent) {
        this.parent = parent;
    }

    public List<Comment> getChildren() {
        return children;
    }

    public void setChildren(List<Comment> children) {
        this.children = children;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }

    public Integer getDepthLevel() {
        return depthLevel;
    }

    public void setDepthLevel(Integer depthLevel) {
        this.depthLevel = depthLevel;
    }

    public String getTreePath() {
        return treePath;
    }

    public void setTreePath(String treePath) {
        this.treePath = treePath;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Integer getTotalRepliesCount() {
        return totalRepliesCount;
    }

    public void setTotalRepliesCount(Integer totalRepliesCount) {
        this.totalRepliesCount = totalRepliesCount;
    }

    public Integer getDirectRepliesCount() {
        return directRepliesCount;
    }

    public void setDirectRepliesCount(Integer directRepliesCount) {
        this.directRepliesCount = directRepliesCount;
    }
}
