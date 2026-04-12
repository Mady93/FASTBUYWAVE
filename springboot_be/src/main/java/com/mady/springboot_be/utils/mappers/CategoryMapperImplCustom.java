package com.mady.springboot_be.utils.mappers;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.springframework.stereotype.Component;

import com.mady.springboot_be.dtos.CategoryDTO;
import com.mady.springboot_be.entities.Category;

/**
 * Custom mapper for recursive Category entity to CategoryDTO conversion.
 * 
 * Handles circular references by tracking processed IDs to prevent infinite
 * recursion.
 * Provides both full recursive mapping and base field mapping.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Component
public class CategoryMapperImplCustom {

    /**
     * Converts a Category entity to a CategoryDTO recursively.
     * 
     * @param category the entity to convert
     * @return the corresponding DTO with full tree structure
     */
    public CategoryDTO toDTORecursive(Category category) {
        return toDTORecursive(category, new HashSet<>());
    }

    /**
     * Converts a Category entity to a CategoryDTO recursively with cycle detection.
     * 
     * @param category     the entity to convert
     * @param processedIds set of already processed IDs to prevent cycles
     * @return the corresponding DTO
     */
    public CategoryDTO toDTORecursive(Category category, Set<Long> processedIds) {
        if (category == null)
            return null;

        CategoryDTO dto = mapBaseFields(category);

        // Prevent circular reference infinite recursion
        if (!processedIds.add(category.getCategoryId())) {
            return dto;
        }

        // Map parent (base fields only)
        if (category.getParent() != null) {
            dto.setParent(mapBaseFields(category.getParent()));
        }

        // Map children recursively
        if (category.getChildren() != null && !category.getChildren().isEmpty()) {
            Set<CategoryDTO> childrenDTOs = category.getChildren().stream()
                    .map(child -> toDTORecursive(child, processedIds))
                    .collect(Collectors.toSet());
            dto.setChildren(childrenDTOs);
        }

        return dto;
    }

    /**
     * Converts a list of Category entities to a list of CategoryDTOs recursively.
     * 
     * @param categories the list of entities
     * @return the list of corresponding DTOs
     */
    public List<CategoryDTO> toDTORecursiveList(List<Category> categories) {
        Set<Long> processedIds = new HashSet<>();
        return categories.stream()
                .map(c -> toDTORecursive(c, processedIds))
                .collect(Collectors.toList());
    }

    /**
     * Maps only the base fields of a Category entity (no recursion).
     * 
     * @param category the entity
     * @return DTO with only base fields
     */
    private CategoryDTO mapBaseFields(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setCategoryId(category.getCategoryId());
        dto.setLabel(category.getLabel());
        dto.setIcon(category.getIcon());
        dto.setActive(category.getActive());
        dto.setLink(category.getLink());
        dto.setName(category.getName());
        return dto;
    }
}
