package com.mady.springboot_be.utils.mappers.cart_order_payment;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.cart_order_payment.PaymentDTO;
import com.mady.springboot_be.entities.Payment;

/**
 * MapStruct mapper for converting between Payment entity and PaymentDTO.
 * 
 * Uses Spring component model for dependency injection.
 * Unmapped target properties are ignored to avoid compilation warnings.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PaymentMapper {

    /**
     * Converts a Payment entity to a PaymentDTO.
     * 
     * @param payment the Payment entity to convert
     * @return the corresponding PaymentDTO
     */
    PaymentDTO toDTO(Payment payment);

    /**
     * Converts a PaymentDTO to a Payment entity.
     * 
     * The order field is ignored to prevent circular references.
     * 
     * @param paymentDTO the PaymentDTO to convert
     * @return the corresponding Payment entity
     */
    @Mapping(target = "order", ignore = true)
    Payment toEntity(PaymentDTO paymentDTO);

    /**
     * Converts a list of Payment entities to a list of PaymentDTOs.
     * 
     * @param payments the list of Payment entities to convert
     * @return the list of corresponding PaymentDTOs
     */
    List<PaymentDTO> toDTOList(List<Payment> payments);
}