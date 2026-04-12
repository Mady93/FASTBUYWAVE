package com.mady.springboot_be.entities;

import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import jakarta.persistence.EmbeddedId;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.MapsId;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;

@NamedQuery(name = "UserAdvertisementLike.findByUserIdAndAdvertisementId", query = "SELECT ual FROM UserAdvertisementLike ual WHERE ual.user.id = :userId AND ual.advertisement.id = :advertisementId")
@NamedQuery(name = "UserAdvertisementLike.countByAdvertisementIdAndLikedTrue", query = "SELECT COUNT(u) FROM UserAdvertisementLike u WHERE u.advertisement.id = :advertisementId AND u.liked = true")
@NamedQuery(name = "UserAdvertisementLike.existsByUserIdAndAdvertisementIdAndLikedTrue", query = "SELECT CASE WHEN COUNT(ual) > 0 THEN true ELSE false END "
        +
        "FROM UserAdvertisementLike ual " +
        "WHERE ual.user.id = :userId AND ual.advertisement.id = :advertisementId AND ual.liked = true")

@NamedQuery(name = "UserAdvertisementLike.findByAdvertisementIdAndLikedTrue", query = "SELECT ual FROM UserAdvertisementLike ual WHERE ual.advertisement.id = :advertisementId AND ual.liked = true")
@NamedQuery(name = "UserAdvertisementLike.findByIdUserIdAndLikedTrue", query = "SELECT ual FROM UserAdvertisementLike ual WHERE ual.id.userId = :userId AND ual.liked = true")
@Entity
@Table(name = "user_advertisement_likes")
public class UserAdvertisementLike {

    @EmbeddedId
    private UserAdvertisementLikeId id = new UserAdvertisementLikeId();

    @ManyToOne
    @MapsId("userId")
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne
    @MapsId("advertisementId")
    @JoinColumn(name = "advertisement_id")
    private Advertisement advertisement;

    @Column(name = "liked", nullable = false)
    private boolean liked;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public UserAdvertisementLike() {
    }

    public UserAdvertisementLike(UserAdvertisementLikeId id, User user, Advertisement advertisement, boolean liked,
            LocalDateTime createdAt) {
        this.id = id;
        this.user = user;
        this.advertisement = advertisement;
        this.liked = liked;
        this.createdAt = createdAt;
    }

    public UserAdvertisementLikeId getId() {
        return this.id;
    }

    public void setId(UserAdvertisementLikeId id) {
        this.id = id;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Advertisement getAdvertisement() {
        return this.advertisement;
    }

    public void setAdvertisement(Advertisement advertisement) {
        this.advertisement = advertisement;
    }

    public boolean getLiked() {
        return this.liked;
    }

    public void setLiked(boolean liked) {
        this.liked = liked;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Embeddable
    public static class UserAdvertisementLikeId implements Serializable {

        private static final long serialVersionUID = 2025042200017L;

        private Long userId;
        private Long advertisementId;

        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public Long getAdvertisementId() {
            return advertisementId;
        }

        public void setAdvertisementId(Long advertisementId) {
            this.advertisementId = advertisementId;
        }

        public UserAdvertisementLikeId() {
        }

        public UserAdvertisementLikeId(Long userId, Long advertisementId) {
            super();
            this.userId = userId;
            this.advertisementId = advertisementId;
        }

        @Override
        public boolean equals(Object o) {
            if (this == o)
                return true;
            if (o == null || getClass() != o.getClass())
                return false;
            UserAdvertisementLikeId other = (UserAdvertisementLikeId) o;
            return Objects.equals(userId, other.userId) &&
                    Objects.equals(advertisementId, other.advertisementId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(userId, advertisementId);
        }
    }

}
