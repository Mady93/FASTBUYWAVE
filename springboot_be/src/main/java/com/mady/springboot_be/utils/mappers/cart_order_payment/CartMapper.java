package com.mady.springboot_be.utils.mappers.cart_order_payment;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.cart_order_payment.CartDTO;
import com.mady.springboot_be.dtos.cart_order_payment.CartItemDTO;
import com.mady.springboot_be.entities.Cart;
import com.mady.springboot_be.entities.CartItem;

/**
 * MapStruct mapper for Cart and CartItem entities to DTOs.
 * 
 * Uses:
 * - ProductOrderMapper for product mapping within cart items
 * - UserOrderMapper for user mapping within cart
 * 
 * Unmapped properties are ignored to avoid compilation warnings.
 * 
 * Calculated fields (totalAmount, totalItems, subtotal) are ignored
 * and computed manually in the service layer.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { ProductOrderMapper.class,
        UserOrderMapper.class })
public interface CartMapper {

    /**
     * Converts a Cart entity to a CartDTO.
     * 
     * Maps user ID and email from the associated user.
     * totalAmount and totalItems are ignored (calculated manually in service).
     * 
     * @param cart the Cart entity to convert
     * @return the corresponding CartDTO
     */
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.email", target = "userEmail")
    @Mapping(target = "totalAmount", ignore = true) // Calculated manually in service
    @Mapping(target = "totalItems", ignore = true) // Calculated manually in service
    CartDTO toDTO(Cart cart);

    /**
     * Converts a CartDTO to a Cart entity.
     * 
     * user and cartItems are ignored to prevent circular references.
     * 
     * @param cartDTO the CartDTO to convert
     * @return the corresponding Cart entity
     */
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "cartItems", ignore = true)
    Cart toEntity(CartDTO cartDTO);

    /**
     * Converts a CartItem entity to a CartItemDTO.
     * 
     * Maps the associated product using ProductOrderMapper.
     * subtotal is ignored (calculated manually in service).
     * 
     * @param cartItem the CartItem entity to convert
     * @return the corresponding CartItemDTO
     */
    @Mapping(source = "product", target = "product")
    @Mapping(target = "subtotal", ignore = true) // Calculated manually in service
    CartItemDTO toDTO(CartItem cartItem);

    /**
     * Converts a CartItemDTO to a CartItem entity.
     * 
     * cart is ignored to prevent circular references.
     * 
     * @param cartItemDTO the CartItemDTO to convert
     * @return the corresponding CartItem entity
     */
    @Mapping(target = "cart", ignore = true)
    CartItem toEntity(CartItemDTO cartItemDTO);

    /**
     * Converts a list of Cart entities to a list of CartDTOs.
     * 
     * @param carts the list of Cart entities
     * @return the list of corresponding CartDTOs
     */
    List<CartDTO> toDTOList(List<Cart> carts);

    /**
     * Converts a list of CartItem entities to a list of CartItemDTOs.
     * 
     * @param cartItems the list of CartItem entities
     * @return the list of corresponding CartItemDTOs
     */
    List<CartItemDTO> toCartItemDTOList(List<CartItem> cartItems);
}
