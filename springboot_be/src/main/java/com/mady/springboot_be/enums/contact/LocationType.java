package com.mady.springboot_be.enums.contact;

/**
 * Represents the type of location for an appointment.
 * 
 * Currently, only in-person meetings are supported.
 * This enum is designed for future extensibility (e.g., ONLINE, PHONE_CALL).
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public enum LocationType {

    /**
     * In-person meeting at a physical location.
     * Requires address details (locationAddress, latitude, longitude).
     * This is the only supported location type in the current version.
     */
    IN_PERSON
}
