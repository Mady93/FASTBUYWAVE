package com.mady.springboot_be.dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

/**
 * Data Transfer Object for advertisement information.
 * 
 * Represents a product advertisement posted by a user. Contains all metadata
 * about the advertisement including title, description, status, type,
 * agency information (if applicable), and relationships to:
 * - Creator (UserDTO)
 * - Category (CategoryDTO)
 * - Product (ProductDTO)
 * - Profile (ProfileDTO)
 * 
 * The advertisement serves as the main entry point for product listings,
 * connecting users, products, categories, and profiles.
 * 
 * Status can be: ACTIVE, PENDING, EXPIRED, etc.
 * Type can be: SELL, BUY, RENT, etc.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AdvertisementDTO implements Serializable {

    private static final long serialVersionUID = 202504220006L;

    private Long advertisementId;
    private String title;
    private String description;
    private String status;
    private LocalDateTime createdAt;
    private String type;
    private LocalDateTime renewedAt;
    private boolean agency;
    private String agencyName;
    private int agencyFeePercent;
    private String agencyUrl;
    private boolean active;
    private UserDTO createdBy;
    private CategoryDTO category;
    private ProductDTO product;
    private ProfileDTO profile;

    /**
     * Default constructor.
     */
    public AdvertisementDTO() {
    }

    /**
     * Constructs an AdvertisementDTO with creator, category, product, and profile.
     * Sets active to true by default.
     * 
     * @param createdBy the user who created the advertisement
     * @param category  the category this advertisement belongs to
     * @param product   the product being advertised
     * @param profile   the profile of the creator
     */
    public AdvertisementDTO(UserDTO createdBy, CategoryDTO category, ProductDTO product, ProfileDTO profile) {
        this.createdBy = createdBy;
        this.category = category;
        this.product = product;
        this.profile = profile;
        this.active = true;
    }

    /**
     * Constructs an AdvertisementDTO with all fields.
     * 
     * @param title            the advertisement title
     * @param description      the advertisement description
     * @param status           the advertisement status
     * @param createdAt        creation timestamp
     * @param type             advertisement type (SELL, BUY, RENT)
     * @param renewedAt        renewal timestamp
     * @param agency           whether this is an agency listing
     * @param agencyName       name of the agency
     * @param agencyFeePercent agency fee percentage
     * @param agencyUrl        agency website URL
     * @param active           whether the advertisement is active
     * @param createdBy        creator user DTO
     * @param category         category DTO
     * @param product          product DTO
     * @param profile          profile DTO
     */
    public AdvertisementDTO(String title, String description, String status, LocalDateTime createdAt, String type,
            LocalDateTime renewedAt, boolean agency, String agencyName, int agencyFeePercent, String agencyUrl,
            boolean active, UserDTO createdBy, CategoryDTO category, ProductDTO product, ProfileDTO profile) {
        this.title = title;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
        this.type = type;
        this.renewedAt = renewedAt;
        this.agency = agency;
        this.agencyName = agencyName;
        this.agencyFeePercent = agencyFeePercent;
        this.agencyUrl = agencyUrl;
        this.active = active;
        this.createdBy = createdBy;
        this.category = category;
        this.product = product;
        this.profile = profile;
    }

    /**
     * Returns the advertisement ID.
     * 
     * @return the advertisement ID
     */
    public Long getAdvertisementId() {
        return this.advertisementId;
    }

    /**
     * Sets the advertisement ID.
     * 
     * @param advertisementId the advertisement ID to set
     */
    public void setAdvertisementId(Long advertisementId) {
        this.advertisementId = advertisementId;
    }

    /**
     * Returns the advertisement title.
     * 
     * @return the title
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * Sets the advertisement title.
     * 
     * @param title the title to set
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns the advertisement description.
     * 
     * @return the description
     */
    public String getDescription() {
        return this.description;
    }

    /**
     * Sets the advertisement description.
     * 
     * @param description the description to set
     */
    public void setDescription(String description) {
        this.description = description;
    }

    /**
     * Returns the advertisement status.
     * 
     * @return the status (ACTIVE, PENDING, EXPIRED)
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * Sets the advertisement status.
     * 
     * @param status the status to set (ACTIVE, PENDING, EXPIRED)
     */
    public void setStatus(String status) {
        this.status = status;
    }

    /**
     * Returns the creation timestamp.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Sets the creation timestamp.
     * 
     * @param createdAt the creation timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the advertisement type.
     * 
     * @return the type (SELL, BUY, RENT)
     */
    public String getType() {
        return this.type;
    }

    /**
     * Sets the advertisement type.
     * 
     * @param type the type to set (SELL, BUY, RENT)
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns the renewal timestamp.
     * 
     * @return the renewal timestamp
     */
    public LocalDateTime getRenewedAt() {
        return this.renewedAt;
    }

    /**
     * Sets the renewal timestamp.
     * 
     * @param renewedAt the renewal timestamp to set
     */
    public void setRenewedAt(LocalDateTime renewedAt) {
        this.renewedAt = renewedAt;
    }

    /**
     * Returns whether this is an agency listing.
     * 
     * @return true if agency listing, false otherwise
     */
    public boolean isAgency() {
        return this.agency;
    }

    /**
     * Returns whether this is an agency listing (getter for frameworks).
     * 
     * @return true if agency listing, false otherwise
     */
    public boolean getAgency() {
        return this.agency;
    }

    /**
     * Sets the agency flag.
     * 
     * @param agency true for agency listing
     */
    public void setAgency(boolean agency) {
        this.agency = agency;
    }

    /**
     * Returns the agency name.
     * 
     * @return the agency name
     */
    public String getAgencyName() {
        return this.agencyName;
    }

    /**
     * Sets the agency name.
     * 
     * @param agencyName the agency name to set
     */
    public void setAgencyName(String agencyName) {
        this.agencyName = agencyName;
    }

    /**
     * Returns the agency fee percentage.
     * 
     * @return the fee percentage
     */
    public int getAgencyFeePercent() {
        return this.agencyFeePercent;
    }

    /**
     * Sets the agency fee percentage.
     * 
     * @param agencyFeePercent the fee percentage to set
     */
    public void setAgencyFeePercent(int agencyFeePercent) {
        this.agencyFeePercent = agencyFeePercent;
    }

    /**
     * Returns the agency website URL.
     * 
     * @return the agency URL
     */
    public String getAgencyUrl() {
        return this.agencyUrl;
    }

    /**
     * Sets the agency website URL.
     * 
     * @param agencyUrl the URL to set
     */
    public void setAgencyUrl(String agencyUrl) {
        this.agencyUrl = agencyUrl;
    }

    /**
     * Returns the associated profile.
     * 
     * @return the profile DTO
     */
    public ProfileDTO getProfile() {
        return this.profile;
    }

    /**
     * Sets the associated profile.
     * 
     * @param profile the profile to set
     */
    public void setProfile(ProfileDTO profile) {
        this.profile = profile;
    }

    /**
     * Returns whether the advertisement is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return this.active;
    }

    /**
     * Returns whether the advertisement is active (getter for frameworks).
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
     * Returns the creator user DTO.
     * 
     * @return the creator
     */
    public UserDTO getCreatedBy() {
        return this.createdBy;
    }

    /**
     * Sets the creator user DTO.
     * 
     * @param createdBy the creator to set
     */
    public void setCreatedBy(UserDTO createdBy) {
        this.createdBy = createdBy;
    }

    /**
     * Returns the category DTO.
     * 
     * @return the category
     */
    public CategoryDTO getCategory() {
        return this.category;
    }

    /**
     * Sets the category DTO.
     * 
     * @param category the category to set
     */
    public void setCategory(CategoryDTO category) {
        this.category = category;
    }

    /**
     * Returns the product DTO.
     * 
     * @return the product
     */
    public ProductDTO getProduct() {
        return this.product;
    }

    /**
     * Sets the product DTO.
     * 
     * @param product the product to set
     */
    public void setProduct(ProductDTO product) {
        this.product = product;
    }

    /**
     * Fluent setter for advertisementId.
     * 
     * @param advertisementId the advertisement ID
     * @return this instance for method chaining
     */
    public AdvertisementDTO advertisementId(Long advertisementId) {
        setAdvertisementId(advertisementId);
        return this;
    }

    /**
     * Fluent setter for title.
     * 
     * @param title the title
     * @return this instance for method chaining
     */
    public AdvertisementDTO title(String title) {
        setTitle(title);
        return this;
    }

    /**
     * Fluent setter for description.
     * 
     * @param description the description
     * @return this instance for method chaining
     */
    public AdvertisementDTO description(String description) {
        setDescription(description);
        return this;
    }

    /**
     * Fluent setter for status.
     * 
     * @param status the status
     * @return this instance for method chaining
     */
    public AdvertisementDTO status(String status) {
        setStatus(status);
        return this;
    }

    /**
     * Fluent setter for createdAt.
     * 
     * @param createdAt the creation timestamp
     * @return this instance for method chaining
     */
    public AdvertisementDTO createdAt(LocalDateTime createdAt) {
        setCreatedAt(createdAt);
        return this;
    }

    /**
     * Fluent setter for type.
     * 
     * @param type the type
     * @return this instance for method chaining
     */
    public AdvertisementDTO type(String type) {
        setType(type);
        return this;
    }

    /**
     * Fluent setter for renewedAt.
     * 
     * @param renewedAt the renewal timestamp
     * @return this instance for method chaining
     */
    public AdvertisementDTO renewedAt(LocalDateTime renewedAt) {
        setRenewedAt(renewedAt);
        return this;
    }

    /**
     * Fluent setter for agency.
     * 
     * @param agency true for agency listing
     * @return this instance for method chaining
     */
    public AdvertisementDTO agency(boolean agency) {
        setAgency(agency);
        return this;
    }

    /**
     * Fluent setter for agencyName.
     * 
     * @param agencyName the agency name
     * @return this instance for method chaining
     */
    public AdvertisementDTO agencyName(String agencyName) {
        setAgencyName(agencyName);
        return this;
    }

    /**
     * Fluent setter for agencyFeePercent.
     * 
     * @param agencyFeePercent the agency fee percentage
     * @return this instance for method chaining
     */
    public AdvertisementDTO agencyFeePercent(int agencyFeePercent) {
        setAgencyFeePercent(agencyFeePercent);
        return this;
    }

    /**
     * Fluent setter for agencyUrl.
     * 
     * @param agencyUrl the agency URL
     * @return this instance for method chaining
     */
    public AdvertisementDTO agencyUrl(String agencyUrl) {
        setAgencyUrl(agencyUrl);
        return this;
    }

    /**
     * Fluent setter for active.
     * 
     * @param active true for active
     * @return this instance for method chaining
     */
    public AdvertisementDTO active(boolean active) {
        setActive(active);
        return this;
    }

    /**
     * Fluent setter for createdBy.
     * 
     * @param createdBy the creator user DTO
     * @return this instance for method chaining
     */

    public AdvertisementDTO createdBy(UserDTO createdBy) {
        setCreatedBy(createdBy);
        return this;
    }

    /**
     * Fluent setter for category.
     * 
     * @param category the category DTO
     * @return this instance for method chaining
     */
    public AdvertisementDTO category(CategoryDTO category) {
        setCategory(category);
        return this;
    }

    public AdvertisementDTO product(ProductDTO product) {
        setProduct(product);
        return this;
    }

    /**
     * Returns a string representation of the AdvertisementDTO.
     * 
     * @return string with all advertisement fields
     */
    @Override
    public String toString() {
        return "{" +
                " advertisementId='" + getAdvertisementId() + "'" +
                ", title='" + getTitle() + "'" +
                ", description='" + getDescription() + "'" +
                ", status='" + getStatus() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", type='" + getType() + "'" +
                ", renewedAt='" + getRenewedAt() + "'" +
                ", agency='" + isAgency() + "'" +
                ", agencyName='" + getAgencyName() + "'" +
                ", agencyFeePercent='" + getAgencyFeePercent() + "'" +
                ", agencyUrl='" + getAgencyUrl() + "'" +
                ", active='" + isActive() + "'" +
                ", createdBy='" + getCreatedBy() + "'" +
                ", category='" + getCategory() + "'" +
                ", product='" + getProduct() + "'" +
                ", profile='" + getProfile() + "'" +
                "}";
    }

}
