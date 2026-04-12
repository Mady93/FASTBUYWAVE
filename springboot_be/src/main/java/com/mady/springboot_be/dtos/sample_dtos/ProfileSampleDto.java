package com.mady.springboot_be.dtos.sample_dtos;

import java.io.Serializable;
import java.time.LocalDate;

import com.mady.springboot_be.dtos.AddressDTO;

/**
 * Data Transfer Object for user profile information (sample version).
 * 
 * Contains complete profile information including personal details,
 * contact information, address, statistics (rating, sales, purchases),
 * preferences, and security questions.
 * 
 * Used for:
 * - User profile display and editing
 * - Advertisement creator information
 * - Appointment participant information
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProfileSampleDto implements Serializable {

    private static final long serialVersionUID = 2025042200016L;

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
    private String securityQuestion;
    private String securityAnswer;
    private Boolean newsletterSubscription;
    private String preferredLanguage;
    private String currency;
    private boolean active;

    /**
     * Default constructor.
     */
    public ProfileSampleDto() {
    }

    /**
     * Constructs a ProfileSampleDto with all fields.
     * 
     * @param profileId              the profile ID
     * @param firstName              the first name
     * @param lastName               the last name
     * @param dateOfBirth            the date of birth
     * @param gender                 the gender
     * @param phoneNumber            the phone number
     * @param address                the associated address
     * @param profilePicture         the profile picture bytes
     * @param userType               the user type (e.g., buyer, seller, both)
     * @param rating                 the user rating (1-5)
     * @param totalSales             total number of sales
     * @param totalPurchases         total number of purchases
     * @param securityQuestion       security question for password recovery
     * @param securityAnswer         security answer
     * @param newsletterSubscription whether subscribed to newsletter
     * @param preferredLanguage      preferred language (e.g., en, it)
     * @param currency               preferred currency (e.g., USD, EUR)
     * @param active                 whether the profile is active
     */
    public ProfileSampleDto(Long profileId, String firstName, String lastName, LocalDate dateOfBirth, String gender,
            String phoneNumber, AddressDTO address, byte[] profilePicture, String userType, Double rating,
            Integer totalSales, Integer totalPurchases, String securityQuestion, String securityAnswer,
            Boolean newsletterSubscription, String preferredLanguage, String currency, boolean active) {
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
        this.securityQuestion = securityQuestion;
        this.securityAnswer = securityAnswer;
        this.newsletterSubscription = newsletterSubscription;
        this.preferredLanguage = preferredLanguage;
        this.currency = currency;
        this.active = active;
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
     * @param dateOfBirth the date of birth to set
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
     * @return the address
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
     * @param profilePicture the profile picture to set as byte array
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
     * @param userType the user type to set
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
     * @param totalSales the total sales count to set
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
     * @param totalPurchases the total purchases count to set
     */
    public void setTotalPurchases(Integer totalPurchases) {
        this.totalPurchases = totalPurchases;
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
     * Sets the security question for password recovery.
     * 
     * @param securityQuestion the security question to set
     */
    public void setSecurityQuestion(String securityQuestion) {
        this.securityQuestion = securityQuestion;
    }

    /**
     * Returns the security answer for password recovery.
     * 
     * @return the security answer
     */
    public String getSecurityAnswer() {
        return this.securityAnswer;
    }

    /**
     * Sets the security answer for password recovery.
     * 
     * @param securityAnswer the security answer to set
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
     * @param preferredLanguage the language code to set (e.g., "en", "it")
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
     * @param currency the currency code to set (e.g., "USD", "EUR")
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
     * Sets the active status of the profile.
     * 
     * @param active true to set as active, false to set as inactive
     */
    public void setActive(boolean active) {
        this.active = active;
    }

    /**
     * Fluent setter for profileId.
     * 
     * @param profileId the profile ID
     * @return this instance for method chaining
     */
    public ProfileSampleDto profileId(Long profileId) {
        setProfileId(profileId);
        return this;
    }

    /**
     * Fluent setter for firstName.
     * 
     * @param firstName the first name
     * @return this instance for method chaining
     */
    public ProfileSampleDto firstName(String firstName) {
        setFirstName(firstName);
        return this;
    }

    /**
     * Fluent setter for lastName.
     * 
     * @param lastName the last name
     * @return this instance for method chaining
     */
    public ProfileSampleDto lastName(String lastName) {
        setLastName(lastName);
        return this;
    }

    /**
     * Fluent setter for dateOfBirth.
     * 
     * @param dateOfBirth the date of birth
     * @return this instance for method chaining
     */
    public ProfileSampleDto dateOfBirth(LocalDate dateOfBirth) {
        setDateOfBirth(dateOfBirth);
        return this;
    }

    /**
     * Fluent setter for gender.
     * 
     * @param gender the gender
     * @return this instance for method chaining
     */
    public ProfileSampleDto gender(String gender) {
        setGender(gender);
        return this;
    }

    /**
     * Fluent setter for phoneNumber.
     * 
     * @param phoneNumber the phone number
     * @return this instance for method chaining
     */
    public ProfileSampleDto phoneNumber(String phoneNumber) {
        setPhoneNumber(phoneNumber);
        return this;
    }

    /**
     * Fluent setter for address.
     * 
     * @param address the associated address
     * @return this instance for method chaining
     */
    public ProfileSampleDto address(AddressDTO address) {
        setAddress(address);
        return this;
    }

    /**
     * Fluent setter for profilePicture.
     * 
     * @param profilePicture the profile picture bytes
     * @return this instance for method chaining
     */
    public ProfileSampleDto profilePicture(byte[] profilePicture) {
        setProfilePicture(profilePicture);
        return this;
    }

    /**
     * Fluent setter for userType.
     * 
     * @param userType the user type
     * @return this instance for method chaining
     */
    public ProfileSampleDto userType(String userType) {
        setUserType(userType);
        return this;
    }

    /**
     * Fluent setter for rating.
     * 
     * @param rating the user rating
     * @return this instance for method chaining
     */
    public ProfileSampleDto rating(Double rating) {
        setRating(rating);
        return this;
    }

    /**
     * Fluent setter for totalSales.
     * 
     * @param totalSales the total sales count
     * @return this instance for method chaining
     */
    public ProfileSampleDto totalSales(Integer totalSales) {
        setTotalSales(totalSales);
        return this;
    }

    /**
     * Fluent setter for totalPurchases.
     * 
     * @param totalPurchases the total purchases count
     * @return this instance for method chaining
     */
    public ProfileSampleDto totalPurchases(Integer totalPurchases) {
        setTotalPurchases(totalPurchases);
        return this;
    }

    /**
     * Fluent setter for securityQuestion.
     * 
     * @param securityQuestion the security question
     * @return this instance for method chaining
     */
    public ProfileSampleDto securityQuestion(String securityQuestion) {
        setSecurityQuestion(securityQuestion);
        return this;
    }

    /**
     * Fluent setter for securityAnswer.
     * 
     * @param securityAnswer the security answer
     * @return this instance for method chaining
     */
    public ProfileSampleDto securityAnswer(String securityAnswer) {
        setSecurityAnswer(securityAnswer);
        return this;
    }

    /**
     * Fluent setter for newsletterSubscription.
     * 
     * @param newsletterSubscription the newsletter subscription flag
     * @return this instance for method chaining
     */
    public ProfileSampleDto newsletterSubscription(Boolean newsletterSubscription) {
        setNewsletterSubscription(newsletterSubscription);
        return this;
    }

    /**
     * Fluent setter for preferredLanguage.
     * 
     * @param preferredLanguage the language code
     * @return this instance for method chaining
     */
    public ProfileSampleDto preferredLanguage(String preferredLanguage) {
        setPreferredLanguage(preferredLanguage);
        return this;
    }

    /**
     * Fluent setter for currency.
     * 
     * @param currency the currency code
     * @return this instance for method chaining
     */
    public ProfileSampleDto currency(String currency) {
        setCurrency(currency);
        return this;
    }

    /**
     * Returns a string representation of the ProfileSampleDto.
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
                + (profilePicture != null ? "[image bytes: " + profilePicture.length + " bytes]" : "null") + '\'' +
                ", userType='" + getUserType() + "'" +
                ", rating='" + getRating() + "'" +
                ", totalSales='" + getTotalSales() + "'" +
                ", totalPurchases='" + getTotalPurchases() + "'" +
                ", securityQuestion='" + getSecurityQuestion() + "'" +
                ", securityAnswer='" + getSecurityAnswer() + "'" +
                ", newsletterSubscription='" + isNewsletterSubscription() + "'" +
                ", preferredLanguage='" + getPreferredLanguage() + "'" +
                ", currency='" + getCurrency() + "'" +
                ", active='" + getActive() + "'" +
                "}";
    }

}
