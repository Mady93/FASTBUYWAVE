package com.mady.springboot_be.utils.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.AdvertisementDTO;
import com.mady.springboot_be.entities.Advertisement;

/**
 * MapStruct mapper for Advertisement entity to AdvertisementDTO conversion.
 * 
 * Provides bidirectional mapping between Advertisement entity and
 * AdvertisementDTO.
 * Unmapped properties are ignored to avoid compilation warnings.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface AdvertisementMapper {

    /**
     * Converts an Advertisement entity to an AdvertisementDTO.
     * 
     * @param advertisement the Advertisement entity to convert
     * @return the corresponding AdvertisementDTO
     */
    AdvertisementDTO toDto(Advertisement advertisement);

    /**
     * Converts an AdvertisementDTO to an Advertisement entity.
     * 
     * @param advertisementDTO the AdvertisementDTO to convert
     * @return the corresponding Advertisement entity
     */
    Advertisement toEntity(AdvertisementDTO advertisementDTO);

    /**
     * Converts a list of Advertisement entities to a list of AdvertisementDTOs.
     * 
     * @param advertisements the list of Advertisement entities
     * @return the list of corresponding AdvertisementDTOs
     */
    List<AdvertisementDTO> toDtoList(List<Advertisement> advertisements);
}
