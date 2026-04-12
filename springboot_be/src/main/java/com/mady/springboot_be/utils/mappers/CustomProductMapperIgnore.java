package com.mady.springboot_be.utils.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Mappings;

import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.entities.Product;

/**
 * MapStruct mapper for Product entity to DTO conversion that ignores
 * circular reference fields.
 * 
 * Ignores the following fields to prevent infinite recursion:
 * - address (circular reference with product)
 * - advertisement (circular reference with product)
 * - images (circular reference with product)
 * - version (JPA version field, not needed in DTO)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface CustomProductMapperIgnore {

    /**
     * Converts a ProductDTO to a Product entity, ignoring circular reference
     * fields.
     * 
     * @param dto the ProductDTO to convert
     * @return the corresponding Product entity
     */
    @Mappings({
            @Mapping(target = "address", ignore = true),
            @Mapping(target = "advertisement", ignore = true),
            @Mapping(target = "images", ignore = true),
            @Mapping(target = "version", ignore = true)
    })
    Product toEntity(ProductDTO dto);

}
