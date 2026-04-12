package com.mady.springboot_be.entities;

import java.time.LocalDate;
import java.util.List;

import org.hibernate.annotations.Cascade;

import jakarta.persistence.CascadeType;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@NamedQuery(name = "Profile.findByNotDeleted", query = "SELECT p FROM Profile p WHERE p.active = true")
@NamedQuery(name = "Profile.countByNotDeleted", query = "SELECT count(p) FROM Profile p WHERE p.active = true")
@NamedQuery(name = "Profile.findByIdByNotDeleted", query = "SELECT p FROM Profile p WHERE p.profileId = :profileId AND p.active = true")
@NamedQuery(name = "Profile.findByDeleted", query = "SELECT p FROM Profile p WHERE p.active = false")
@NamedQuery(name = "Profile.countByDeleted", query = "SELECT count(p) FROM Profile p WHERE p.active = false")
@NamedQuery(name = "Profile.findByNotDeletedList", query = "SELECT p FROM Profile p WHERE p.active = true")
@NamedQuery(name = "Profile.findByDeletedList", query = "SELECT p FROM Profile p WHERE p.active = false")
@NamedQuery(name = "Profile.findByUserId", query = "SELECT a FROM Profile a WHERE a.user.userId = :userId AND a.active = true")
@Valid
@Table(name = "profile")
@Entity
public class Profile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "profile_id")
    private Long profileId;

    // Nome dell'utente
    @NotNull(message = "First name cannot be null")
    @Pattern(regexp = "^[A-Za-zà-ù][A-Za-zà-ù.\\s]*$", message = "Invalid name format")
    @Column(name = "first_name")
    private String firstName;

    // Cognome dell'utente
    @NotNull(message = "Last name cannot be null")
    @Pattern(regexp = "^[A-Za-zà-ù][A-Za-zà-ù.\\s]*$", message = "Invalid name format")
    @Column(name = "last_name")
    private String lastName;

    // Data di nascita dell'utente
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    // Genere dell'utente (es. "Maschio", "Femmina", "Altro")
    @Column(name = "gender")
    private String gender;

    // Numero di telefono
    @Column(name = "phone_number")
    private String phoneNumber;

    // Indirizzo fisico dell'utente
    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address_id") // Questa è la colonna FK nella tabella Profile
    private Address address;

    // Immagine profilo dell'utente
    @Lob
    @Column(name = "profile_picture", columnDefinition = "LONGBLOB")
    private byte[] profilePicture;

    // Tipo utente: "Venditore", "Acquirente", "Entrambi"
    @Column(name = "user_type")
    private String userType;

    // Valutazione media dell'utente (es. 4.5 stelle)
    @Column(name = "rating")
    private Double rating;

    // Numero totale di vendite concluse (per venditori)
    @Column(name = "total_sales")
    private Integer totalSales;

    // Numero totale di acquisti effettuati (per acquirenti)
    @Column(name = "total_purchases")
    private Integer totalPurchases;

    // Lista dei desideri dell'utente
    @ElementCollection
    @CollectionTable(name = "profile_wishlist", joinColumns = @JoinColumn(name = "profile_id"))
    @Cascade(org.hibernate.annotations.CascadeType.ALL)
    private List<String> wishlist;

    // Domanda di sicurezza per il recupero dell'account
    @Column(name = "security_question")
    private String securityQuestion;

    // Risposta alla domanda di sicurezza
    @Column(name = "security_answer")
    private String securityAnswer;

    // Indica se l'utente è iscritto alla newsletter
    @Column(name = "newsletter_subscription")
    private Boolean newsletterSubscription;

    // Lingua preferita per l'interfaccia (es. "it", "en")
    @Column(name = "preferred_language")
    private String preferredLanguage;

    // Valuta preferita per le transazioni (es. "EUR", "USD")
    @Column(name = "currency")
    private String currency;

    @Column(name = "active")
    private boolean active;

    // Preferenze di notifica (es. ["email", "sms", "push"])
    @ElementCollection
    @CollectionTable(name = "profile_notifications", joinColumns = @JoinColumn(name = "profile_id"))
    @Cascade(org.hibernate.annotations.CascadeType.ALL)
    private List<String> notificationPreferences;

    // Impostazioni privacy (es. ["visibile", "solo amici", "anonimo"])
    @ElementCollection
    @CollectionTable(name = "profile_privacy", joinColumns = @JoinColumn(name = "profile_id"))
    @Cascade(org.hibernate.annotations.CascadeType.ALL)
    private List<String> privacySettings;

    @OneToOne(fetch = FetchType.EAGER, cascade = CascadeType.ALL)
    @JoinColumn(name = "user", referencedColumnName = "user_id")
    private User user;

    public Profile() {
    }

    public Profile(String firstName, String lastName, LocalDate dateOfBirth, String gender, String phoneNumber,
            Address address, byte[] profilePicture, String userType, Double rating, Integer totalSales,
            Integer totalPurchases, List<String> wishlist, String securityQuestion, String securityAnswer,
            Boolean newsletterSubscription, String preferredLanguage, String currency, boolean active,
            List<String> notificationPreferences, List<String> privacySettings, User user) {
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
        this.active = active;
        this.notificationPreferences = notificationPreferences;
        this.privacySettings = privacySettings;
        this.user = user;
    }

    // Getter e Setter
    public Long getProfileId() {
        return profileId;
    }

    public void setProfileId(Long profileId) {
        this.profileId = profileId;
    }

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public LocalDate getDateOfBirth() {
        return dateOfBirth;
    }

    public void setDateOfBirth(LocalDate dateOfBirth) {
        this.dateOfBirth = dateOfBirth;
    }

    public String getGender() {
        return gender;
    }

    public void setGender(String gender) {
        this.gender = gender;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public byte[] getProfilePicture() {
        return profilePicture;
    }

    public void setProfilePicture(byte[] profilePicture) {
        this.profilePicture = profilePicture;
    }

    public String getUserType() {
        return userType;
    }

    public void setUserType(String userType) {
        this.userType = userType;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Integer getTotalSales() {
        return totalSales;
    }

    public void setTotalSales(Integer totalSales) {
        this.totalSales = totalSales;
    }

    public Integer getTotalPurchases() {
        return totalPurchases;
    }

    public void setTotalPurchases(Integer totalPurchases) {
        this.totalPurchases = totalPurchases;
    }

    public List<String> getWishlist() {
        return wishlist;
    }

    public void setWishlist(List<String> wishlist) {
        this.wishlist = wishlist;
    }

    public String getSecurityQuestion() {
        return securityQuestion;
    }

    public void setSecurityQuestion(String securityQuestion) {
        this.securityQuestion = securityQuestion;
    }

    public String getSecurityAnswer() {
        return securityAnswer;
    }

    public void setSecurityAnswer(String securityAnswer) {
        this.securityAnswer = securityAnswer;
    }

    public Boolean getNewsletterSubscription() {
        return newsletterSubscription;
    }

    public void setNewsletterSubscription(Boolean newsletterSubscription) {
        this.newsletterSubscription = newsletterSubscription;
    }

    public String getPreferredLanguage() {
        return preferredLanguage;
    }

    public void setPreferredLanguage(String preferredLanguage) {
        this.preferredLanguage = preferredLanguage;
    }

    public String getCurrency() {
        return currency;
    }

    public void setCurrency(String currency) {
        this.currency = currency;
    }

     public boolean getActive() {
        return active;
    }

    public boolean isActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public List<String> getNotificationPreferences() {
        return notificationPreferences;
    }

    public void setNotificationPreferences(List<String> notificationPreferences) {
        this.notificationPreferences = notificationPreferences;
    }

    public List<String> getPrivacySettings() {
        return privacySettings;
    }

    public void setPrivacySettings(List<String> privacySettings) {
        this.privacySettings = privacySettings;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    // toString method
    @Override
    public String toString() {
        return "Profile{" +
                "profileId=" + profileId +
                ", firstName='" + firstName + '\'' +
                ", lastName='" + lastName + '\'' +
                ", dateOfBirth=" + dateOfBirth +
                ", gender='" + gender + '\'' +
                ", phoneNumber='" + phoneNumber + '\'' +
                ", address=" + address +
                ", profilePicture=" + (profilePicture != null ? profilePicture.length + " bytes" : "null") +
                ", userType='" + userType + '\'' +
                ", rating=" + rating +
                ", totalSales=" + totalSales +
                ", totalPurchases=" + totalPurchases +
                ", wishlist=" + wishlist +
                ", securityQuestion='" + securityQuestion + '\'' +
                ", securityAnswer='" + securityAnswer + '\'' +
                ", newsletterSubscription=" + newsletterSubscription +
                ", preferredLanguage='" + preferredLanguage + '\'' +
                ", currency='" + currency + '\'' +
                ", active=" + active +
                ", notificationPreferences=" + notificationPreferences +
                ", privacySettings=" + privacySettings +
                ", user=" + (user != null ? user.getUserId() : "null") +
                '}';
    }
}
