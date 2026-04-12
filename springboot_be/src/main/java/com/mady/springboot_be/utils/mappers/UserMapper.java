package com.mady.springboot_be.utils.mappers;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.mady.springboot_be.dtos.UserDTO;
import com.mady.springboot_be.entities.User;

/**
 * MapStruct mapper for User entity to UserDTO conversion.
 * 
 * Provides bidirectional mapping between User entity and UserDTO.
 * Password field is mapped explicitly for encoding in the service layer.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface UserMapper {

    /**
     * Converts a UserDTO to a User entity.
     * Password is mapped from DTO to entity for encoding.
     * 
     * @param dto the UserDTO to convert
     * @return the corresponding User entity
     */
    @Mapping(target = "password", source = "password")
    User toUser(UserDTO dto);

    /**
     * Converts a User entity to a UserDTO.
     * Email is explicitly mapped from entity to DTO.
     * 
     * @param user the User entity to convert
     * @return the corresponding UserDTO
     */
    @Mapping(source = "email", target = "email")
    UserDTO toUserDTO(User user);
}