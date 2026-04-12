package com.mady.springboot_be.utils.mappers;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.RefreshTokenDTO;
import com.mady.springboot_be.entities.RefreshToken;

/**
 * MapStruct mapper for RefreshToken entity to RefreshTokenDTO conversion.
 * 
 * Provides bidirectional mapping for:
 * - Single entity/DTO conversion
 * - List conversion
 * 
 * Unmapped properties are ignored to avoid compilation warnings.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, unmappedSourcePolicy = ReportingPolicy.IGNORE)
public interface RefreshTokenMapper {

    /**
     * Converts a RefreshToken entity to a RefreshTokenDTO.
     * 
     * @param token the RefreshToken entity to convert
     * @return the corresponding RefreshTokenDTO
     */
    RefreshTokenDTO toDTO(RefreshToken token);

    /**
     * Converts a RefreshTokenDTO to a RefreshToken entity.
     * 
     * @param tokenDTO the RefreshTokenDTO to convert
     * @return the corresponding RefreshToken entity
     */
    RefreshToken toEntity(RefreshTokenDTO tokenDTO);

    /**
     * Converts a list of RefreshToken entities to a list of RefreshTokenDTOs.
     * 
     * @param tokens the list of RefreshToken entities
     * @return the list of corresponding RefreshTokenDTOs
     */
    List<RefreshTokenDTO> toDTOList(List<RefreshToken> tokens);

    /**
     * Converts a list of RefreshTokenDTOs to a list of RefreshToken entities.
     * 
     * @param tokenDTOs the list of RefreshTokenDTOs
     * @return the list of corresponding RefreshToken entities
     */
    List<RefreshToken> toEntityList(List<RefreshTokenDTO> tokenDTOs);
}
