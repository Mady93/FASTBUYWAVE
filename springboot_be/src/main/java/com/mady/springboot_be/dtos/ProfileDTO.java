package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.List;

/**
 * Data Transfer Object for user profile information.
 * 
 * Contains complete profile information including personal details,
 * contact information, address, statistics (rating, sales, purchases),
 * preferences (wishlist, notifications, privacy), security settings,
 * and associated user account.
 * 
 * Used for:
 * - User profile display and editing
 * - Advertisement creator information
 * - Appointment participant information
 * - Admin user management
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProfileDTO implements Serializable {

    private static final long serialVersionUID = 202504220009L;

    private Long profileId;
    private String firstName;
    private String lastName;
    private LocalDate dateOfBirth;
    private String gender;
    private String phoneNumber;
    private AddressDTO address;
    private byte[] profilePicture;
    private String userType;
    private Double rating;
    private Integer totalSales;
    private Integer totalPurchases;
    private List<String> wishlist;
    private String securityQuestion;
    private String securityAnswer;
    private Boolean newsletterSubscription;
    private String preferredLanguage;
    private String currency;
    private boolean active;
    private List<String> notificationPreferences;
    private List<String> privacySettings;
    private UserDTO user;

    /**
     * Default constructor.
     */
    public ProfileDTO() {
    }

    /**
     * Constructs a ProfileDTO with all fields.
     * 
     * @param profileId               the profile ID
     * @param firstName               the first name
     * @param lastName                the last name
     * @param dateOfBirth             the date of birth
     * @param gender                  the gender
     * @param phoneNumber             the phone number
     * @param address                 the associated address
     * @param profilePicture          the profile picture bytes
     * @param userType                the user type (e.g., buyer, seller, both)
     * @param rating                  the user rating (1-5)
     * @param totalSales              total number of sales
     * @param totalPurchases          total number of purchases
     * @param wishlist                list of liked/wished items
     * @param securityQuestion        security question for password recovery
     * @param securityAnswer          security answer
     * @param newsletterSubscription  whether subscribed to newsletter
     * @param preferredLanguage       preferred language (e.g., en, it)
     * @param currency                preferred currency (e.g., USD, EUR)
     * @param active                  whether the profile is active
     * @param notificationPreferences user's notification settings
     * @param privacySettings         user's privacy settings
     * @param user                    associated user account DTO
     */
    public ProfileDTO(Long profileId, String firstName, String lastName, LocalDate dateOfBirth, String gender,
            String phoneNumber, AddressDTO address, byte[] profilePicture, String userType, Double rating,
            Integer totalSales, Integer totalPurchases, List<String> wishlist, String securityQuestion,
            String securityAnswer, Boolean newsletterSubscription, String preferredLanguage, String currency,
            boolean active, List<String> notificationPreferences, List<String> privacySettings, UserDTO user) {
        this.profileId = profileId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.profilePicture = profilePicture;
        this.userType = userType;
        this.rating = rating;
        this.totalSales = totalSales;
        this.totalPurchases = totalPurchases;
        this.wishlist = wishlist;
        this.securityQuestion = securityQuestion;
        this.securityAnswer = securityAnswer;
        this.newsletterSubscription = newsletterSubscription;
        this.preferredLanguage = preferredLanguage;
        this.currency = currency;
        this.active = true;
        this.notificationPreferences = notificationPreferences;
        this.privacySettings = privacySettings;
        this.user = user;
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
     * Returns the gender.
     * 
     * @return the gender
     */
    public String getGender() {
        return this.gender;
    }

    /**
     * Sets the gender.
     * 
     * @param gender the gender to set
     */
    public void setGender(String gender) {
        this.gender = gender;
    }

    /**
     * Returns the phone number.
     * 
     * @return the phone number
     */
    public String getPhoneNumber() {
        return this.phoneNumber;
    }

    /**
     * Sets the phone number.
     * 
     * @param phoneNumber the phone number to set
     */
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    /**
     * Returns the associated address.
     * 
     * @return the address DTO
     */
    public AddressDTO getAddress() {
        return this.address;
    }

    /**
     * Sets the associated address.
     * 
     * @param address the address to set
     */
    public void setAddress(AddressDTO address) {
        this.address = address;
    }

    /**
     * Returns the profile picture bytes.
     * 
     * @return the profile picture as byte array
     */
    public byte[] getProfilePicture() {
        return this.profilePicture;
    }

    /**
     * Sets the profile picture bytes.
     * 
     * @param profilePicture the byte array to set
     */
    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    /**
     * Returns the user type.
     * 
     * @return the user type (e.g., buyer, seller, both)
     */
    public String getUserType() {
        return this.userType;
    }

    /**
     * Sets the user type.
     * 
     * @param userType the user type to set (e.g., buyer, seller, both)
     */
    public void setUserType(String userType) {
        this.userType = userType;
    }

    /**
     * Returns the user rating.
     * 
     * @return the rating (1-5)
     */
    public Double getRating() {
        return this.rating;
    }

    /**
     * Sets the user rating.
     * 
     * @param rating the rating to set (1-5)
     */
    public void setRating(Double rating) {
        this.rating = rating;
    }

    /**
     * Returns the total number of sales.
     * 
     * @return the total sales count
     */
    public Integer getTotalSales() {
        return this.totalSales;
    }

    /**
     * Sets the total number of sales.
     * 
     * @param totalSales the count to set
     */
    public void setTotalSales(Integer totalSales) {
        this.totalSales = totalSales;
    }

    /**
     * Returns the total number of purchases.
     * 
     * @return the total purchases count
     */
    public Integer getTotalPurchases() {
        return this.totalPurchases;
    }

    /**
     * Sets the total number of purchases.
     * 
     * @param totalPurchases the count to set
     */
    public void setTotalPurchases(Integer totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    /**
     * Returns the wishlist.
     * 
     * @return list of wishlist items
     */
    public List<String> getWishlist() {
        return this.wishlist;
    }

    /**
     * Sets the wishlist.
     * 
     * @param wishlist the wishlist to set
     */
    public void setWishlist(List<String> wishlist) {
        this.wishlist = wishlist;
    }

    /**
     * Returns the security question for password recovery.
     * 
     * @return the security question
     */
    public String getSecurityQuestion() {
        return this.securityQuestion;
    }

    /**
     * Sets the security question.
     * 
     * @param securityQuestion the question to set
     */
    public void setSecurityQuestion(String securityQuestion) {
        this.securityQuestion = securityQuestion;
    }

    /**
     * Returns the security answer.
     * 
     * @return the security answer
     */
    public String getSecurityAnswer() {
        return this.securityAnswer;
    }

    /**
     * Sets the security answer.
     * 
     * @param securityAnswer the answer to set
     */
    public void setSecurityAnswer(String securityAnswer) {
        this.securityAnswer = securityAnswer;
    }

    /**
     * Returns whether subscribed to newsletter.
     * 
     * @return true if subscribed, false otherwise
     */
    public Boolean isNewsletterSubscription() {
        return this.newsletterSubscription;
    }

    /**
     * Returns whether subscribed to newsletter (getter for frameworks).
     * 
     * @return true if subscribed, false otherwise
     */
    public Boolean getNewsletterSubscription() {
        return this.newsletterSubscription;
    }

    /**
     * Sets the newsletter subscription flag.
     * 
     * @param newsletterSubscription true to subscribe
     */
    public void setNewsletterSubscription(Boolean newsletterSubscription) {
        this.newsletterSubscription = newsletterSubscription;
    }

    /**
     * Returns the preferred language.
     * 
     * @return the language code (e.g., "en", "it")
     */
    public String getPreferredLanguage() {
        return this.preferredLanguage;
    }

    /**
     * Sets the preferred language.
     * 
     * @param preferredLanguage the language code to set
     */
    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    /**
     * Returns the preferred currency.
     * 
     * @return the currency code (e.g., "USD", "EUR")
     */
    public String getCurrency() {
        return this.currency;
    }

    /**
     * Sets the preferred currency.
     * 
     * @param currency the currency code to set
     */
    public void setCurrency(String currency) {
        this.currency = currency;
    }

    /**
     * Returns whether the profile is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Sets the active flag.
     * 
     * @param active true for active
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Returns the notification preferences.
     * 
     * @return list of notification preference strings
     */
    public List<String> getNotificationPreferences() {
        return this.notificationPreferences;
    }

    /**
     * Sets the notification preferences.
     * 
     * @param notificationPreferences the preferences to set
     */
    public void setNotificationPreferences(List<String> notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    /**
     * Returns the privacy settings.
     * 
     * @return list of privacy setting strings
     */
    public List<String> getPrivacySettings() {
        return this.privacySettings;
    }

    /**
     * Sets the privacy settings.
     * 
     * @param privacySettings the settings to set
     */
    public void setPrivacySettings(List<String> privacySettings) {
        this.privacySettings = privacySettings;
    }

    /**
     * Returns the associated user account DTO.
     * 
     * @return the user DTO
     */
    public UserDTO getUser() {
        return this.user;
    }

    /**
     * Sets the associated user account DTO.
     * 
     * @param user the user to set
     */
    public void setUser(UserDTO user) {
        this.user = user;
    }

    /**
     * Returns a string representation of the ProfileDTO.
     * 
     * @return string with all profile fields
     */
    @Override
    public String toString() {
        return "{" +
                " profileId='" + getProfileId() + "'" +
                ", firstName='" + getFirstName() + "'" +
                ", lastName='" + getLastName() + "'" +
                ", dateOfBirth='" + getDateOfBirth() + "'" +
                ", gender='" + getGender() + "'" +
                ", phoneNumber='" + getPhoneNumber() + "'" +
                ", address='" + getAddress() + "'" +
                ", profilePicture='"
                + (getProfilePicture() != null ? "[image bytes: " + getProfilePicture().length + " bytes]" : "null")
                + "'" +
                ", userType='" + getUserType() + "'" +
                ", rating='" + getRating() + "'" +
                ", totalSales='" + getTotalSales() + "'" +
                ", totalPurchases='" + getTotalPurchases() + "'" +
                ", wishlist='" + getWishlist() + "'" +
                ", securityQuestion='" + getSecurityQuestion() + "'" +
                ", securityAnswer='" + getSecurityAnswer() + "'" +
                ", newsletterSubscription='" + isNewsletterSubscription() + "'" +
                ", preferredLanguage='" + getPreferredLanguage() + "'" +
                ", currency='" + getCurrency() + "'" +
                ", notificationPreferences='" + getNotificationPreferences() + "'" +
                ", privacySettings='" + getPrivacySettings() + "'" +
                ", user='" + getUser() + "'" +
                "}";
    }

}
