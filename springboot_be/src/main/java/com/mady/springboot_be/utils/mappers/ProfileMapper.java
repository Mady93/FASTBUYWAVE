package com.mady.springboot_be.utils.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.MappingTarget;

import com.mady.springboot_be.dtos.ProfileDTO;
import com.mady.springboot_be.entities.Profile;

/**
 * MapStruct mapper for Profile entity to ProfileDTO conversion.
 * 
 * Provides bidirectional mapping between Profile entity and ProfileDTO.
 * Supports:
 * - Single entity/DTO conversion
 * - List conversion
 * - Partial update from DTO to existing entity
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface ProfileMapper {

    /**
     * Converts a Profile entity to a ProfileDTO.
     * 
     * @param profile the Profile entity to convert
     * @return the corresponding ProfileDTO
     */
    ProfileDTO toDto(Profile profile);

    /**
     * Converts a ProfileDTO to a Profile entity.
     * 
     * @param profileDTO the ProfileDTO to convert
     * @return the corresponding Profile entity
     */
    Profile toEntity(ProfileDTO profileDTO);

    /**
     * Converts a list of Profile entities to a list of ProfileDTOs.
     * 
     * @param profiles the list of Profile entities
     * @return the list of corresponding ProfileDTOs
     */
    List<ProfileDTO> toDtoList(List<Profile> profiles);

    /**
     * Converts a list of ProfileDTOs to a list of Profile entities.
     * 
     * @param profileDTOs the list of ProfileDTOs
     * @return the list of corresponding Profile entities
     */
    List<Profile> toEntityList(List<ProfileDTO> profileDTOs);

    /**
     * Partially updates an existing Profile entity with data from a ProfileDTO.
     * 
     * Only non-null fields from the DTO are applied to the target entity.
     * This is useful for PATCH operations where only specific fields need
     * to be updated without affecting the rest.
     * 
     * @param dto    the source ProfileDTO containing the new values
     * @param entity the target Profile entity to update
     */
    void updateEntityFromDto(ProfileDTO dto, @MappingTarget Profile entity);
}
