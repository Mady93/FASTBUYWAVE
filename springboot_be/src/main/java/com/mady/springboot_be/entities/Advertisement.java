package com.mady.springboot_be.entities;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.constraints.Pattern;

@NamedQuery(name = "Advertisement.findByIdByNotDeleted", query = "SELECT a FROM Advertisement a WHERE a.advertisementId = :advertisementId AND a.active is true")
@Entity
@Table(name = "advertisement")
public class Advertisement {

	@Id
	@Column(name = "advertisement_id")
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long advertisementId;

	@Column(name = "title")
	private String title;

	@Lob
	@Column(name = "description", columnDefinition = "TEXT")
	private String description;

	@Pattern(regexp = "^(ACTIVE|SUSPENDED|CLOSED)$", message = "State must be one of: ACTIVE, SUSPENDED, CLOSED")
	@Column(name = "status")
	private String status;

	@Column(name = "created_at", nullable = false, updatable = false)
	private LocalDateTime createdAt;

	@Column(name = "type")
	private String type;

	@Column(name = "renewed_at")
	private LocalDateTime renewedAt;

	@Column(name = "agency")
	private boolean agency;

	@Column(name = "agency_name")
	private String agencyName;

	@Column(name = "agency_fee_percent")
	private int agencyFeePercent;

	@Lob
	@Column(name = "agency_url", columnDefinition = "TEXT")
	private String agencyUrl;

	@Column(name = "active")
	private boolean active;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "created_by", referencedColumnName = "user_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	 @JsonIgnoreProperties({"password"})
	private User createdBy;

	@ManyToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "category_id", referencedColumnName = "category_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	private Category category;

	@OneToOne(mappedBy = "advertisement", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
	@JsonBackReference
	private Product product;

	@OneToOne(fetch = FetchType.EAGER)
	@JoinColumn(name = "profile", referencedColumnName = "profile_id", nullable = false)
	@OnDelete(action = OnDeleteAction.CASCADE)
	@JsonIgnoreProperties({"user"})
	private Profile profile;

	@Transient
	private Integer likesNumber;
	

	@OneToMany(mappedBy = "advertisement", cascade = CascadeType.ALL, orphanRemoval = true)
	private Set<UserAdvertisementLike> likes = new HashSet<>();

	public Advertisement() {
	}

	public Advertisement(User createdBy, Category category, Product product) {
		this.createdBy = createdBy;
		this.category = category;
		this.product = product;
		this.active = true;
	}


	public Advertisement(Long advertisementId, String title, String description, String status, LocalDateTime createdAt, String type, LocalDateTime renewedAt, boolean agency, String agencyName, int agencyFeePercent, String agencyUrl, boolean active, User createdBy, Category category, Product product, Profile profile, Set<UserAdvertisementLike> likes, Integer likesNumber) {
		this.advertisementId = advertisementId;
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
		this.likes = likes;
		this.likesNumber = likesNumber;
	}
	

	public Long getAdvertisementId() {
		return advertisementId;
	}

	public void setAdvertisementId(Long advertisementId) {
		this.advertisementId = advertisementId;
	}

	public String getTitle() {
		return title;
	}

	public void setTitle(String title) {
		this.title = title;
	}

	public String getDescription() {
		return description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public LocalDateTime getCreatedAt() {
		return createdAt;
	}

	public void setCreatedAt(LocalDateTime createdAt) {
		this.createdAt = createdAt;
	}

	public String getType() {
		return type;
	}

	public void setType(String type) {
		this.type = type;
	}

	public LocalDateTime getRenewedAt() {
		return renewedAt;
	}

	public void setRenewedAt(LocalDateTime renewedAt) {
		this.renewedAt = renewedAt;
	}


	public boolean getAgency() {
		return agency;
	}

	public void setAgency(boolean agency) {
		this.agency = agency;
	}

	public String getAgencyName() {
		return agencyName;
	}

	public void setAgencyName(String agencyName) {
		this.agencyName = agencyName;
	}

	public int getAgencyFeePercent() {
		return agencyFeePercent;
	}

	public void setAgencyFeePercent(int agencyFeePercent) {
		this.agencyFeePercent = agencyFeePercent;
	}

	public String getAgencyUrl() {
		return agencyUrl;
	}

	public void setAgencyUrl(String agencyUrl) {
		this.agencyUrl = agencyUrl;
	}

	public boolean getActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	public User getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(User createdBy) {
		this.createdBy = createdBy;
	}

	public Category getCategory() {
		return category;
	}

	public void setCategory(Category category) {
		this.category = category;
	}

	public Product getProduct() {
		return product;
	}

	public void setProduct(Product product) {
		this.product = product;
	}

	public Profile getProfile() {
		return this.profile;
	}

	public void setProfile(Profile profile) {
		this.profile = profile;
	}


	public Set<UserAdvertisementLike> getLikes() {
		return this.likes;
	}

	public void setLikes(Set<UserAdvertisementLike> likes) {
		this.likes = likes;
	}

	public Integer getLikesNumber() {
		return this.likesNumber;
	}

	public void setLikesNumber(Integer likesNumber) {
		this.likesNumber = likesNumber;
	}



	@Override
	public String toString() {
		return "Announcement{" +
				"advertisementId=" + advertisementId +
				", title='" + title + '\'' +
				", description='" + description + '\'' +
				", status='" + status + '\'' +
				", createdAt=" + createdAt +
				", type='" + type + '\'' +
				", renewedAt=" + renewedAt +
				", agency=" + agency +
				", agencyName='" + agencyName + '\'' +
				", agencyFeePercent=" + agencyFeePercent +
				", agencyUrl='" + agencyUrl + '\'' +
				", active=" + active +
				", createdBy=" + createdBy +
				", category=" + category +
				", product=" + product +
				", profile=" + profile +
				", likes=" + likes +
				", likesNumber=" + likesNumber +
				'}';
	}
}