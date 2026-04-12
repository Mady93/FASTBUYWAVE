package com.mady.springboot_be.entities;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIdentityInfo;
import com.fasterxml.jackson.annotation.JsonIdentityReference;
import com.fasterxml.jackson.annotation.ObjectIdGenerators;

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
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import jakarta.validation.constraints.NotNull;

@NamedQuery(name = "Category.existsByNameActive", query = "SELECT CASE WHEN COUNT(c) > 0 THEN true ELSE false END FROM Category c WHERE c.name = :name AND c.active = true")
@NamedQuery(name = "Category.findAllCategories", query = "SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL")
@NamedQuery(name = "Category.findByNotDeletedList", query = "SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.active = true AND c.parent IS NULL")
@NamedQuery(name = "Category.findByIdByNotDeleted", query = "SELECT c FROM Category c LEFT JOIN FETCH c.parent p LEFT JOIN FETCH c.children WHERE c.categoryId = :categoryId AND c.active = true")
@NamedQuery(name = "Category.findByIdDeleted", query = "SELECT c FROM Category c LEFT JOIN FETCH c.parent p LEFT JOIN FETCH c.children WHERE c.categoryId = :categoryId AND c.active = false")
@NamedQuery(name = "Category.findByName", query = "SELECT c FROM Category c LEFT JOIN FETCH c.parent p LEFT JOIN FETCH c.children WHERE c.name = :name AND c.active = true")
@NamedQuery(name = "Category.findByDeletedList", query = "SELECT c FROM Category c LEFT JOIN FETCH c.children WHERE c.active = false")
@NamedQuery(name = "Category.countByNotDeleted", query = "SELECT COUNT(c) FROM Category c WHERE c.active = true AND c.parent IS NULL")
@NamedQuery(name = "Category.countByDeleted", query = "SELECT COUNT(c) FROM Category c WHERE c.active = false AND c.parent IS NULL")
@NamedQuery(
    name = "Category.findByNameAndParent",
    query = "SELECT c FROM Category c LEFT JOIN FETCH c.parent p LEFT JOIN FETCH c.children WHERE c.name = :name AND c.parent = :parent AND c.active = true"
)
@NamedQuery(
    name = "Category.findByNameAndParentIsNull",
    query = "SELECT c FROM Category c LEFT JOIN FETCH c.parent p LEFT JOIN FETCH c.children WHERE c.name = :name AND c.parent IS NULL AND c.active = true"
)
@NamedQuery(
    name = "Category.findAllRootsWithChildren",
    query = "SELECT DISTINCT c FROM Category c LEFT JOIN FETCH c.children WHERE c.parent IS NULL"
)
@Entity
@Table(name = "category", uniqueConstraints = @UniqueConstraint(columnNames = { "name", "parent_id" }))
public class Category {
    @Id
    @Column(name = "category_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long categoryId;

    @NotNull(message = "Label must not be null")
    @Column(name = "label", nullable = false, length = 200)
    private String label;

    @Column(name = "icon", length = 100)
    private String icon;

    @Column(name = "active")
    private Boolean active;

    @Column(name = "link", length = 500, unique = true)
    private String link;

    @NotNull(message = "Name must not be null")
    @Column(name = "name", nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "parent_id")
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "categoryId")
    @JsonIdentityReference(alwaysAsId = false)
    private Category parent;

    @OneToMany(mappedBy = "parent", fetch = FetchType.EAGER, cascade = { CascadeType.PERSIST, CascadeType.MERGE })
    @JsonIdentityInfo(generator = ObjectIdGenerators.PropertyGenerator.class, property = "categoryId")
    @JsonIdentityReference(alwaysAsId = false)
    private Set<Category> children = new HashSet<>();

    public Category() {
    }

    public Category(Long categoryId, String label, String icon, Boolean active, String link, String name,  Category parent, Set<Category> children) {
        this.categoryId = categoryId;
        this.label = label;
        this.icon = icon;
        this.active = active;
        this.link = link;
        this.name = name;
        this.parent = parent;
        this.children = children;
    }


    public Long getCategoryId() {
        return this.categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public String getLabel() {
        return this.label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getIcon() {
        return this.icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public Boolean isActive() {
        return this.active;
    }

    public Boolean getActive() {
        return this.active;
    }

    public void setActive(Boolean active) {
        this.active = active;
    }

    public String getLink() {
        return this.link;
    }

    public void setLink(String link) {
        this.link = link;
    }

    public String getName() {
        return this.name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Category getParent() {
        return this.parent;
    }

    public void setParent(Category parent) {
        this.parent = parent;
    }

    public Set<Category> getChildren() {
        return this.children;
    }

    public void setChildren(Set<Category> children) {
        this.children = children;
    }
   

    // Metodi per gestire la relazione bidirezionale
    public void addChild(Category child) {
        children.add(child);
        child.setParent(this);
    }

    public void removeChild(Category child) {
        children.remove(child);
        child.setParent(null);
    }

}
