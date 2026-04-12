package com.mady.springboot_be.utils.mappers;

import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.ProductDTO;
import com.mady.springboot_be.entities.Product;

/**
 * MapStruct mapper for Product entity to ProductDTO conversion.
 * 
 * Uses:
 * - AddressMapper for address field mapping
 * 
 * Features:
 * - Bidirectional conversion (toEntity / toDto)
 * - Partial update method that only updates price and active fields
 * - Ignores unmapped properties to avoid compilation warnings
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", uses = { AddressMapper.class },
        unmappedTargetPolicy = ReportingPolicy.IGNORE, 
        unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface ProductMapper {

    /**
     * Converts a ProductDTO to a Product entity.
     * 
     * @param dto the ProductDTO to convert
     * @return the corresponding Product entity
     */
    Product toEntity(ProductDTO dto);

    /**
     * Converts a Product entity to a ProductDTO.
     * 
     * @param entity the Product entity to convert
     * @return the corresponding ProductDTO
     */
    ProductDTO toDto(Product entity);

        /**
     * Partially updates a Product entity with price and active fields from DTO.
     * Only updates price and active, ignoring all other fields.
     * Null values in the DTO are ignored (keep existing values).
     * 
     * @param source the source ProductDTO containing new values
     * @param target the target Product entity to update
     */
    @Mapping(target = "price", source = "price")
    @Mapping(target = "active", source = "active")
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updatePriceAndActiveFromDto(ProductDTO source, @MappingTarget Product target);
}
