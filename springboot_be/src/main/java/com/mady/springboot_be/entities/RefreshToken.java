package com.mady.springboot_be.entities;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;

@Entity
public class RefreshToken {
    @Id
    @Column(name = "token_id")
    private String tokenId; // Identificativo unico del token (es: UUID)

    @Column(name = "user_id")
    private Long userId; // ID dell'utente associato al token

    @Column(name = "client_id")
    private String clientId;

    @Column(name = "scopes")
    private String scopes;

    @Column(name = "roles")
    private String roles;

    @Column(name = "expiration_date")
    private LocalDateTime expirationDate; // Data di scadenza del token

    @Column(name = "revoked")
    private boolean revoked; // Flag che indica se il token è stato revocato

    public RefreshToken() {}

    public RefreshToken(String tokenId, Long userId, String clientId, String scopes, String roles, 
                        LocalDateTime expirationDate, boolean revoked) {
        this.tokenId = tokenId;
        this.userId = userId;
        this.clientId = clientId;
        this.scopes = scopes;
        this.roles = roles;
        this.expirationDate = expirationDate;
        this.revoked = revoked;
    }

    public String getTokenId() {
        return tokenId;
    }

    public void setTokenId(String tokenId) {
        this.tokenId = tokenId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getClientId() {
        return clientId;
    }

    public void setClientId(String clientId) {
        this.clientId = clientId;
    }

    public String getScopes() {
        return scopes;
    }

    public void setScopes(String scopes) {
        this.scopes = scopes;
    }

    public String getRoles() {
        return roles;
    }

    public void setRoles(String roles) {
        this.roles = roles;
    }

    public LocalDateTime getExpirationDate() {
        return expirationDate;
    }

    public void setExpirationDate(LocalDateTime expirationDate) {
        this.expirationDate = expirationDate;
    }

    public boolean isRevoked() {
        return revoked;
    }

    public void setRevoked(boolean revoked) {
        this.revoked = revoked;
    }

    @Override
    public String toString() {
        return "RefreshToken{" +
                "tokenId='" + tokenId + '\'' +
                ", userId=" + userId +
                ", clientId='" + clientId + '\'' +
                ", scopes='" + scopes + '\'' +
                ", roles='" + roles + '\'' +
                ", expirationDate=" + expirationDate +
                ", revoked=" + revoked +
                '}';
    }
}
