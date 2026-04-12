package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.util.HashSet;
import java.util.Set;

/**
 * Data Transfer Object for recursive category structure.
 * 
 * Represents a hierarchical category entity with self-referencing parent/child
 * relationships.
 * This DTO is used to display category trees in the frontend, supporting:
 * - Parent-child relationships via parent reference (not just ID)
 * - Recursive children set for complete tree traversal
 * - Active/inactive status filtering
 * - Unique constraints on (name, parent_id) to prevent branch duplicates
 * 
 * The recursive structure is serialization-safe when using @JsonIdentityInfo
 * to prevent infinite recursion loops.
 * 
 * Used for:
 * - Product category navigation
 * - Admin category management with recursive save/update operations
 * - Toggling entire sub-trees (activate/deactivate)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class CategoryDTO implements Serializable {

    private static final long serialVersionUID = 202504220005L;

    private Long categoryId;
    private String label;
    private String icon;
    private Boolean active;
    private String link;
    private String name;
    private CategoryDTO parent;
    private Set<CategoryDTO> children = new HashSet<>();

    /**
     * Default constructor.
     */
    public CategoryDTO() {
    }

    /**
     * Constructs a CategoryDTO with all fields.
     * 
     * @param categoryId unique identifier
     * @param label      display label
     * @param icon       icon identifier
     * @param active     whether active
     * @param link       URL-friendly identifier
     * @param name       unique name within same parent
     * @param parent     parent category (null for root)
     * @param children   child categories
     */
    public CategoryDTO(Long categoryId, String label, String icon, Boolean active, String link, String name,
            CategoryDTO parent, Set<CategoryDTO> children) {
        this.categoryId = categoryId;
        this.label = label;
        this.icon = icon;
        this.active = active;
        this.link = link;
        this.name = name;
        this.parent = parent;
        this.children = children;
    }

    /**
     * Returns the category ID.
     * 
     * @return the category ID
     */
    public Long getCategoryId() {
        return this.categoryId;
    }

    /**
     * Sets the category ID.
     * 
     * @param categoryId the ID to set
     */
    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    /**
     * Returns the display label.
     * 
     * @return the label
     */
    public String getLabel() {
        return this.label;
    }

    /**
     * Sets the display label.
     * 
     * @param label the label to set
     */
    public void setLabel(String label) {
        this.label = label;
    }

    /**
     * Returns the icon identifier.
     * 
     * @return the icon
     */
    public String getIcon() {
        return this.icon;
    }

    /**
     * Sets the icon identifier.
     * 
     * @param icon the icon to set
     */
    public void setIcon(String icon) {
        this.icon = icon;
    }

    /**
     * Returns whether the category is active.
     * 
     * @return true if active, false otherwise
     */
    public Boolean getActive() {
        return this.active;
    }

    /**
     * Sets the active status of the category.
     * 
     * @param active the active status to set
     */
    public void setActive(Boolean active) {
        this.active = active;
    }

    /**
     * Returns the URL-friendly link identifier.
     * 
     * @return the link
     */
    public String getLink() {
        return this.link;
    }

    /**
     * Sets the URL-friendly link identifier.
     * 
     * @param link the link to set
     */
    public void setLink(String link) {
        this.link = link;
    }

    /**
     * Returns the category name (unique within same parent).
     * 
     * @return the name
     */
    public String getName() {
        return this.name;
    }

    /**
     * Sets the category name.
     * 
     * @param name the name to set
     */
    public void setName(String name) {
        this.name = name;
    }

    /**
     * Returns the parent category.
     * 
     * @return the parent, or null if root
     */
    public CategoryDTO getParent() {
        return this.parent;
    }

    /**
     * Sets the parent category.
     * 
     * @param parent the parent to set (null for root)
     */
    public void setParent(CategoryDTO parent) {
        this.parent = parent;
    }

    /**
     * Returns the child categories.
     * 
     * @return the children
     */
    public Set<CategoryDTO> getChildren() {
        return this.children;
    }

    /**
     * Sets the child categories.
     * 
     * @param children the children to set
     */
    public void setChildren(Set<CategoryDTO> children) {
        this.children = children;
    }

    /**
     * Returns the parent category ID (convenience method).
     * 
     * @return parent ID, or null if no parent
     */
    public Long getParentId() {
        return parent != null ? parent.getCategoryId() : null;
    }

    /**
     * Sets the parent category by ID (convenience method).
     * Creates a minimal parent DTO with only the ID.
     * 
     * @param parentId the parent ID to set, or null for root
     */
    public void setParentId(Long parentId) {
        if (parentId != null) {
            // Creates a minimal parent CategoryDTO with only the ID
            this.parent = new CategoryDTO();
            this.parent.setCategoryId(parentId);
        } else {
            this.parent = null;
        }
    }

    /**
     * Returns a string representation of the CategoryDTO.
     * 
     * @return string with all category fields
     */
    @Override
    public String toString() {
        return "{" +
                " categoryId='" + getCategoryId() + "'" +
                ", label='" + getLabel() + "'" +
                ", icon='" + getIcon() + "'" +
                ", active='" + getActive() + "'" +
                ", link='" + getLink() + "'" +
                ", name='" + getName() + "'" +
                ", parent='" + getParent() + "'" +
                ", children='" + getChildren() + "'" +
                "}";
    }

}
