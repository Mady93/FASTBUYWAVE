package com.mady.springboot_be.utils.abs;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonProperty.Access;

/**
 * Jackson mixin class for UserDTO to control password field serialization.
 * 
 * This mixin ensures that the password field is only included in JSON
 * during deserialization (when receiving data) but NEVER during serialization
 * (when sending data to the client).
 * 
 * This prevents sensitive password data from being exposed in API responses.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public abstract class UserDTOMixin {

    /**
     * Password field is write-only: can be deserialized from input
     * but will never be serialized to output.
     * 
     * @return the password (only used during deserialization)
     */
    @JsonProperty(access = Access.WRITE_ONLY)
    public abstract String getPassword();
}