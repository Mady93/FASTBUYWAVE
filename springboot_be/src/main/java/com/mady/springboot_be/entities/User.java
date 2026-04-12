package com.mady.springboot_be.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.persistence.Transient;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

@NamedQuery(name = "User.existsByEmail", query = "SELECT COUNT(u) > 0 FROM User u WHERE u.email = :email")
@NamedQuery(name = "User.findUserByEmail", query = "SELECT u FROM User u WHERE u.email = :email AND u.active = true")
@NamedQuery(name = "User.countByRoles", query = "SELECT COUNT(u) FROM User u WHERE u.roles = :roles AND u.active = true")
@NamedQuery(name = "User.countByNotDeleted", query = "SELECT COUNT(u) FROM User u WHERE u.active = true")
@NamedQuery(name = "User.findByNotDeleted", query = "SELECT u FROM User u WHERE u.active = true")
@NamedQuery(name = "User.countByDeleted", query = "SELECT COUNT(u) FROM User u WHERE u.active = false")
@NamedQuery(name = "User.findByDeleted", query = "SELECT u FROM User u WHERE u.active = false")
@NamedQuery(name = "User.getUsersByRoles", query = "SELECT u FROM User u WHERE u.roles = :role AND u.active = true")
@NamedQuery(name = "User.findUserByIdByNotDeleted", query = "SELECT u FROM User u WHERE u.userId = :userId AND u.active = true")
@NamedQuery(name = "User.findByUserIdGoogleNotDeleted", query = "SELECT u FROM User u WHERE u.userIdGoogle = :googleId AND u.active = true")

@Valid
@Entity
@Table(name = "users")
public class User {
    @Id
    @Column(name = "user_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long userId;

    @Column(name = "user_id_google", unique = true)
    private String userIdGoogle;

    @Transient
    @Column(name = "google_access_token", nullable = true)
    private String googleAccessToken;

    @NotNull(message = "Email cannot be null")
    @Pattern(regexp = "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\\." + "[A-Za-z0-9!#$%&'*+/=?^_`{|}~-]+)*@"
            + "(?:[A-Za-z0-9](?:[A-Za-z0-9-]*[A-Za-z0-9])?\\.)+[A-Za-z0-9]"
            + "(?:[A-Za-z0-9-]*[A-Za-z0-9])?", message = "Email format not valid")
    @Column(name = "email", unique = true)
    private String email;

    @Column(name = "password", nullable = true)
    private String password;

    @NotNull(message = "Roles cannot be null")
    @Pattern(regexp = "^(ADMIN|USER)$", message = "Role must be one of: ADMIN, USER")
    @Column(name = "roles")
    private String roles;

    @Column(name = "scopes")
    private String scopes;

    @Column(name = "registration_date")
    private LocalDateTime registrationDate;

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "active")
    private boolean active;

    public User() {
    }

    public User(String userIdGoogle, String email, String roles,
            String scopes, LocalDateTime registrationDate, LocalDateTime lastLogin, boolean active, String googleAccessToken) {
        this.userIdGoogle = userIdGoogle;
        this.email = email;
        this.roles = roles;
        this.scopes = scopes;
        this.registrationDate = registrationDate;
        this.lastLogin = lastLogin;
        this.active = true;
        this.googleAccessToken = googleAccessToken;
    }

    public User(String userIdGoogle, String email, String password, String roles, String scopes,
            LocalDateTime registrationDate, LocalDateTime lastLogin, boolean active) {
        this.userIdGoogle = userIdGoogle;
        this.email = email;
        this.password = password;
        this.roles = roles;
        this.scopes = scopes;
        this.registrationDate = registrationDate;
        this.lastLogin = lastLogin;
        this.active = true;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getUserIdGoogle() {
        return userIdGoogle;
    }

    public void setUserIdGoogle(String userIdGoogle) {
        this.userIdGoogle = userIdGoogle;
    }


    public String getGoogleAccessToken() {
        return this.googleAccessToken;
    }

    public void setGoogleAccessToken(String googleAccessToken) {
        this.googleAccessToken = googleAccessToken;
    }

    public boolean isActive() {
        return this.active;
    }


    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
		if (roles == null || roles.isEmpty()) {
			this.roles = "User"; // Imposta il valore predefinito "User" se il valore è vuoto
		} else {
			this.roles = roles;
		}
	}

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public LocalDateTime getRegistrationDate() {
        return registrationDate;
    }

    public void setRegistrationDate(LocalDateTime registrationDate) {
        this.registrationDate = registrationDate;
    }

    public LocalDateTime getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(LocalDateTime lastLogin) {
        this.lastLogin = lastLogin;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    @Override
    public String toString() {
        return "User{" +
                "userId=" + userId +
                ", userIdGoogle='" + userIdGoogle + '\'' +
                ", email='" + email + '\'' +
                ", password='" + password + '\'' +
                ", roles='" + roles + '\'' +
                ", scopes='" + scopes + '\'' +
                ", registrationDate=" + registrationDate +
                ", lastLogin=" + lastLogin +
                ", active=" + active +
                '}';
    }

}