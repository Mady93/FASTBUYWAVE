package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

import com.mady.springboot_be.entities.Profile;
import com.mady.springboot_be.entities.User;

/**
 * Data Transfer Object combining User and Profile information.
 * 
 * Contains user account data (ID, email, registration, last login)
 * combined with profile data (name, date of birth, profile image URL).
 * 
 * Used when user information with profile details is needed without
 * exposing sensitive data like password.
 * 
 * The profile image URL points to an endpoint that serves the actual
 * image bytes: /user/{userId}/picture
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class UserProfileDTO implements Serializable {

    private static final long serialVersionUID = 2025042200021L;

    // User fields
    private Long userId;
    private String email;
    private LocalDateTime registrationDate;
    private LocalDateTime lastLogin;

    // Profile fields
    private Long profileId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String profileImageUrl;

    /**
     * Default constructor.
     */
    public UserProfileDTO() {
    }

    /**
     * Constructs a UserProfileDTO from User entity and optional Profile.
     * 
     * If profile is present, extracts profileId, firstName, lastName, dateOfBirth,
     * and generates a profileImageUrl pointing to /user/{userId}/picture.
     * 
     * @param user    the User entity (cannot be null)
     * @param profile Optional containing Profile entity (may be empty)
     */
    public UserProfileDTO(User user, Optional<Profile> profile) {
        this.userId = user.getUserId();
        this.email = user.getEmail();
        this.registrationDate = user.getRegistrationDate();
        this.lastLogin = user.getLastLogin();

        profile.ifPresent(p -> {
            this.profileId = p.getProfileId();
            this.firstName = p.getFirstName();
            this.lastName = p.getLastName();
            this.dateOfBirth = p.getDateOfBirth();
            this.profileImageUrl = Optional.ofNullable(p.getProfilePicture())
                    .map(pic -> "/user/" + user.getUserId() + "/picture")
                    .orElse(null);
        });
    }

    /**
     * Returns the user ID.
     * 
     * @return the user ID
     */
    public Long getUserId() {
        return this.userId;
    }

    /**
     * Sets the user ID.
     * 
     * @param userId the user ID to set
     */
    public void setUserId(Long userId) {
        this.userId = userId;
    }

    /**
     * Returns the user's email address.
     * 
     * @return the email address
     */
    public String getEmail() {
        return this.email;
    }

    /**
     * Sets the user's email address.
     * 
     * @param email the email to set
     */
    public void setEmail(String email) {
        this.email = email;
    }

    /**
     * Returns the registration timestamp.
     * 
     * @return the registration date
     */
    public LocalDateTime getRegistrationDate() {
        return this.registrationDate;
    }

    /**
     * Sets the registration timestamp.
     * 
     * @param registrationDate the timestamp to set
     */
    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    /**
     * Returns the last login timestamp.
     * 
     * @return the last login date
     */
    public LocalDateTime getLastLogin() {
        return this.lastLogin;
    }

    /**
     * Sets the last login timestamp.
     * 
     * @param lastLogin the timestamp to set
     */
    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    /**
     * Returns the profile ID.
     * 
     * @return the profile ID
     */
    public Long getProfileId() {
        return this.profileId;
    }

    /**
     * Sets the profile ID.
     * 
     * @param profileId the profile ID to set
     */
    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    /**
     * Returns the first name.
     * 
     * @return the first name
     */
    public String getFirstName() {
        return this.firstName;
    }

    /**
     * Sets the first name.
     * 
     * @param firstName the first name to set
     */
    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    /**
     * Returns the last name.
     * 
     * @return the last name
     */
    public String getLastName() {
        return this.lastName;
    }

    /**
     * Sets the last name.
     * 
     * @param lastName the last name to set
     */
    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    /**
     * Returns the date of birth.
     * 
     * @return the date of birth
     */
    public LocalDate getDateOfBirth() {
        return this.dateOfBirth;
    }

    /**
     * Sets the date of birth.
     * 
     * @param dateOfBirth the date to set
     */
    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    /**
     * Returns the profile image URL endpoint.
     * 
     * @return the image URL (e.g., "/user/123/picture"), or null if no profile
     *         picture
     */
    public String getProfileImageUrl() {
        return this.profileImageUrl;
    }

    /**
     * Sets the profile image URL.
     * 
     * @param profileImageUrl the URL to set
     */
    public void setProfileImageUrl(String profileImageUrl) {
        this.profileImageUrl = profileImageUrl;
    }

    /**
     * Returns a string representation of the UserProfileDTO.
     * 
     * @return string with all user and profile fields
     */
    @Override
    public String toString() {
        return "{" +
                " userId='" + getUserId() + "'" +
                ", email='" + getEmail() + "'" +
                ", registrationDate='" + getRegistrationDate() + "'" +
                ", lastLogin='" + getLastLogin() + "'" +
                ", profileId='" + getProfileId() + "'" +
                ", firstName='" + getFirstName() + "'" +
                ", lastName='" + getLastName() + "'" +
                ", dateOfBirth='" + getDateOfBirth() + "'" +
                ", profileImageUrl='" + getProfileImageUrl() + "'" +
                "}";
    }

}
