package com.mady.springboot_be.utils.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.AdvertisementDTO;
import com.mady.springboot_be.entities.Advertisement;

/**
 * Custom MapStruct mapper for Advertisement entity to DTO conversion that
 * ignores
 * circular reference fields.
 * 
 * Ignores the following fields to prevent infinite recursion:
 * - createdBy: User who created the advertisement
 * - category: Category associated with the advertisement
 * - product: Product associated with the advertisement
 * 
 * Useful when mapping from DTO to entity without causing bidirectional loops.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface CustomAdvertisementMapperIgnore {

    /**
     * Converts an AdvertisementDTO to an Advertisement entity,
     * ignoring circular reference fields.
     * 
     * The following fields are ignored:
     * - createdBy (prevents User → Advertisement → User loop)
     * - category (prevents Category → Advertisement → Category loop)
     * - product (prevents Product → Advertisement → Product loop)
     * 
     * @param advertisementDTO the AdvertisementDTO to convert
     * @return the corresponding Advertisement entity with ignored fields set to
     *         null
     */
    @Mapping(target = "createdBy", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "product", ignore = true)
    Advertisement toEntity(AdvertisementDTO advertisementDTO);
}
