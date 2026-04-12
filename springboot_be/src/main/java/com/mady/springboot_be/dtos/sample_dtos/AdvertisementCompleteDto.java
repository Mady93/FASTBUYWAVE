package com.mady.springboot_be.dtos.sample_dtos;

import java.io.Serializable;
import java.time.LocalDateTime;

import com.mady.springboot_be.dtos.UserDTO;

/**
 * Data Transfer Object for complete advertisement information.
 * 
 * Contains all advertisement details including title, description,
 * status, type, agency information, creator (UserDTO), associated profile,
 * and like count.
 * 
 * Used when returning full advertisement data to the frontend.
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AdvertisementCompleteDto implements Serializable {

    private static final long serialVersionUID = 2025042200012L;

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
    private ProfileSampleDto profile;
    private Integer likesNumber;

    /**
     * Default constructor.
     */
    public AdvertisementCompleteDto() {
    }

    /**
     * Constructs an AdvertisementCompleteDto with creator.
     * 
     * @param createdBy the user who created the advertisement
     */
    public AdvertisementCompleteDto(UserDTO createdBy) {
        this.createdBy = createdBy;
        this.active = true;
    }

    /**
     * Constructs an AdvertisementCompleteDto with all fields.
     * 
     * @param title            advertisement title
     * @param description      advertisement description
     * @param status           advertisement status
     * @param createdAt        creation timestamp
     * @param type             advertisement type
     * @param renewedAt        renewal timestamp
     * @param agency           whether agency listing
     * @param agencyName       name of agency
     * @param agencyFeePercent agency fee percentage
     * @param agencyUrl        agency website URL
     * @param active           whether active
     * @param createdBy        creator user DTO
     * @param profile          associated profile
     * @param likesNumber      number of likes
     */
    public AdvertisementCompleteDto(String title, String description, String status, LocalDateTime createdAt,
            String type, LocalDateTime renewedAt, boolean agency, String agencyName, int agencyFeePercent,
            String agencyUrl, boolean active, UserDTO createdBy, ProfileSampleDto profile, Integer likesNumber) {
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
        this.profile = profile;
        this.likesNumber = likesNumber;
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
     * @param advertisementId the ID to set
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
     * @return the status
     */
    public String getStatus() {
        return this.status;
    }

    /**
     * Sets the advertisement status.
     * 
     * @param status the status to set
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
     * @param createdAt the timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the advertisement type.
     * 
     * @return the type
     */
    public String getType() {
        return this.type;
    }

    /**
     * Sets the advertisement type.
     * 
     * @param type the type to set
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
     * @param renewedAt the timestamp to set
     */
    public void setRenewedAt(LocalDateTime renewedAt) {
        this.renewedAt = renewedAt;
    }

    /**
     * Returns whether this is an agency listing.
     * 
     * @return true if agency, false otherwise
     */
    public boolean isAgency() {
        return this.agency;
    }

    /**
     * Returns whether this is an agency listing (getter for frameworks).
     * 
     * @return true if agency, false otherwise
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
     * @param agencyName the name to set
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
     * @param agencyFeePercent the percentage to set
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
    public ProfileSampleDto getProfile() {
        return this.profile;
    }

    /**
     * Sets the associated profile.
     * 
     * @param profile the profile DTO to set
     */
    public void setProfile(ProfileSampleDto profile) {
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
     * Returns the number of likes.
     * 
     * @return the likes count
     */
    public Integer getLikesNumber() {
        return this.likesNumber;
    }

    /**
     * Sets the number of likes.
     * 
     * @param likesNumber the count to set
     */
    public void setLikesNumber(Integer likesNumber) {
        this.likesNumber = likesNumber;
    }

    /**
     * Returns a string representation of the AdvertisementCompleteDto.
     * 
     * @return string with all fields
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
                ", profile='" + getProfile() + "'" +
                ", likesNumber='" + getLikesNumber() + "'" +
                "}";
    }

}
