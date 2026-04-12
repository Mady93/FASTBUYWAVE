package com.mady.springboot_be.utils.mappers.cart_order_payment;

import java.util.List;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import com.mady.springboot_be.dtos.cart_order_payment.OrderDTO;
import com.mady.springboot_be.dtos.cart_order_payment.OrderItemDTO;
import com.mady.springboot_be.entities.Order;
import com.mady.springboot_be.entities.OrderItem;

/**
 * MapStruct mapper for Order and OrderItem entities to DTOs.
 * 
 * Uses:
 * - UserOrderMapper for user mapping within orders
 * - ProductOrderMapper for product mapping within order items
 * - PaymentMapper for payment mapping within orders
 * 
 * Unmapped properties are ignored to avoid compilation warnings.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE, uses = { UserOrderMapper.class,
        ProductOrderMapper.class, PaymentMapper.class })
public interface OrderMapper {

    /**
     * Converts an Order entity to an OrderDTO.
     * 
     * Maps user, orderItems, and payment associations.
     * 
     * @param order the Order entity to convert
     * @return the corresponding OrderDTO
     */
    @Mapping(source = "user", target = "user")
    @Mapping(source = "orderItems", target = "orderItems")
    @Mapping(source = "payment", target = "payment")
    OrderDTO toDTO(Order order);

    /**
     * Converts an OrderDTO to an Order entity.
     * 
     * user, orderItems, and payment are ignored to prevent circular references.
     * 
     * @param orderDTO the OrderDTO to convert
     * @return the corresponding Order entity
     */
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "orderItems", ignore = true)
    @Mapping(target = "payment", ignore = true)
    Order toEntity(OrderDTO orderDTO);

    /**
     * Converts an OrderItem entity to an OrderItemDTO.
     * 
     * Maps the associated product using ProductOrderMapper.
     * 
     * @param orderItem the OrderItem entity to convert
     * @return the corresponding OrderItemDTO
     */
    @Mapping(source = "product", target = "product")
    OrderItemDTO toDTO(OrderItem orderItem);

    /**
     * Converts an OrderItemDTO to an OrderItem entity.
     * 
     * order is ignored to prevent circular references.
     * 
     * @param orderItemDTO the OrderItemDTO to convert
     * @return the corresponding OrderItem entity
     */
    @Mapping(target = "order", ignore = true)
    OrderItem toEntity(OrderItemDTO orderItemDTO);

    /**
     * Converts a list of Order entities to a list of OrderDTOs.
     * 
     * @param orders the list of Order entities
     * @return the list of corresponding OrderDTOs
     */
    List<OrderDTO> toDTOList(List<Order> orders);

    /**
     * Converts a list of OrderItem entities to a list of OrderItemDTOs.
     * 
     * @param orderItems the list of OrderItem entities
     * @return the list of corresponding OrderItemDTOs
     */
    List<OrderItemDTO> toOrderItemDTOList(List<OrderItem> orderItems);
}
