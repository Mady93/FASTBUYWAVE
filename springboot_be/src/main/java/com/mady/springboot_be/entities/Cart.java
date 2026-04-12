package com.mady.springboot_be.entities;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Table(name = "cart")
@Entity
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id")
    private Long cartId;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    @Column(name = "active")
    private boolean active;
    
    // Relazione Many-to-One con User (UNIDIREZIONALE)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", referencedColumnName = "user_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnoreProperties({"user_id_google", "google_access_token", "password", "roles", "scopes"})
    private User user;

    // ✅ Cascade PERSIST e MERGE (non ALL!)
     @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<CartItem> cartItems = new ArrayList<>();
    
     public Cart() {}

    public Cart(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Cart(Long cartId, LocalDateTime createdAt, LocalDateTime updatedAt, boolean active, User user, List<CartItem> cartItems) {
        this.cartId = cartId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.active = active;
        this.user = user;
        this.cartItems = cartItems;
    }
    


    public Long getCartId() {
        return this.cartId;
    }

    public void setCartId(Long cartId) {
        this.cartId = cartId;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return this.updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public boolean isActive() {
        return this.active;
    }

    public boolean getActive() {
        return this.active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public User getUser() {
        return this.user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public List<CartItem> getCartItems() {
        return this.cartItems;
    }

    public void setCartItems(List<CartItem> cartItems) {
        this.cartItems = cartItems;
    }

    
    public BigDecimal getTotalPrice() {
        // Calcoleremo il totale via query o service
        return BigDecimal.ZERO;
    }
    
   
    // Metodo per aggiungere items CORRETTO
    public void addCartItem(CartItem item) {
        cartItems.add(item);
        item.setCart(this); // ✅ Imposta la relazione inversa
    }



    @Override
    public String toString() {
        return "{" +
            " cartId='" + getCartId() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", updatedAt='" + getUpdatedAt() + "'" +
            ", active='" + isActive() + "'" +
            ", user='" + getUser() + "'" +
            ", cartItems='" + getCartItems() + "'" +
            "}";
    }

}
