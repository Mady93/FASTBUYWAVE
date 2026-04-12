package com.mady.springboot_be.utils.mappers.cart_order_payment;

import java.util.List;

import org.mapstruct.Mapper;

import com.mady.springboot_be.dtos.cart_order_payment.UserSummaryDTO;
import com.mady.springboot_be.entities.User;

/**
 * MapStruct mapper for converting User entity to UserSummaryDTO.
 * 
 * Maps only essential user information (ID, email, roles) to avoid
 * circular references and reduce payload size in order responses.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface UserOrderMapper {

    /**
     * Converts a User entity to a UserSummaryDTO.
     * 
     * @param user the User entity to convert
     * @return the corresponding UserSummaryDTO
     */
    UserSummaryDTO toSummaryDTO(User user);

    /**
     * Converts a list of User entities to a list of UserSummaryDTOs.
     * 
     * @param users the list of User entities to convert
     * @return the corresponding list of UserSummaryDTOs
     */
    List<UserSummaryDTO> toSummaryDTOList(List<User> users);
}
