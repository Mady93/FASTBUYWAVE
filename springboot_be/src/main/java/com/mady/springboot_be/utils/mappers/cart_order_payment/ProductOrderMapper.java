package com.mady.springboot_be.utils.mappers.cart_order_payment;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.mady.springboot_be.dtos.cart_order_payment.ProductSummaryDTO;
import com.mady.springboot_be.entities.Product;

/**
 * MapStruct mapper for converting Product entity to ProductSummaryDTO.
 * 
 * Maps fields from Product entity and its relationships:
 * - advertisement.title → title
 * - address.country → productCountry
 * - imageUrl is ignored (calculated manually to add Base64 encoding)
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring")
public interface ProductOrderMapper {

    /**
     * Converts a Product entity to a ProductSummaryDTO.
     * 
     * @param product the Product entity to convert
     * @return the corresponding ProductSummaryDTO
     */
    @Mapping(source = "advertisement.title", target = "title")
    @Mapping(target = "imageUrl", ignore = true) // Calcolato manualmente
    @Mapping(source = "address.country", target = "productCountry") // Aggiungi questa riga
    ProductSummaryDTO toSummaryDTO(Product product);

    /**
     * Converts a list of Product entities to a list of ProductSummaryDTOs.
     * 
     * @param products the list of Product entities to convert
     * @return the list of corresponding ProductSummaryDTOs
     */
    List<ProductSummaryDTO> toSummaryDTOList(List<Product> products);
}
