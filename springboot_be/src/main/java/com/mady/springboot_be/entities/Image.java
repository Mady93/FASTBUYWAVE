package com.mady.springboot_be.entities;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import com.fasterxml.jackson.annotation.JsonBackReference;

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
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@NamedQuery(name = "Image.countByNotDeleted", query = "SELECT count(i) FROM Image i WHERE i.active is true")
@NamedQuery(name = "Image.findByNotDeleted", query = "SELECT i FROM Image i WHERE i.active is true")
@NamedQuery(name = "Image.countByDeleted", query = "SELECT count(i) FROM Image i WHERE i.active is false")
@NamedQuery(name = "Image.findByDeleted", query = "SELECT i FROM Image i WHERE i.active is false")
@NamedQuery(name = "Image.findByIdByNotDeleted", query = "SELECT i FROM Image i WHERE i.imageId = :id AND i.active is true")
@NamedQuery(name = "Image.findByNotDeletedList", query = "SELECT i FROM Image i WHERE i.active is true")
@NamedQuery(name = "Image.findByDeletedList", query = "SELECT i FROM Image i WHERE i.active is true")
@NamedQuery(name = "Image.deactivateById", query = "UPDATE Image p SET p.active = false WHERE p.imageId = :imageId")
@NamedQuery(name = "Image.findByProductIdActiveTrue", query = "SELECT a FROM Image a WHERE a.product.productId = :productId AND a.active = true")
@NamedQuery(name = "Image.findByProductIdActiveFalse", query = "SELECT a FROM Image a WHERE a.product.productId = :productId AND a.active = false")
@Entity
@Table(name = "image")
public class Image {

    @Id
    @Column(name = "image_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long imageId;

    @Lob
    @NotNull(message = "Image cannot be null")
    @Column(name = "pic_byte", columnDefinition = "LONGBLOB")
    private byte[] picByte;

    @Column(name = "active")
    private boolean active;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", referencedColumnName = "product_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    // @JsonIgnore
    @JsonBackReference
    private Product product;

    public Image() {
    }

    public Image(byte[] picByte, Product product) {
        this.picByte = picByte;
        if (product != null) {
            product.addImage(this); // Use the safe method
        }
        this.active = true;
    }

    public Long getImageId() {
        return imageId;
    }

    public void setImageId(Long imageId) {
        this.imageId = imageId;
    }

    public byte[] getPicByte() {
        return picByte;
    }

    public void setPicByte(byte[] picByte) {
        this.picByte = picByte;
    }

    public boolean isActive() {
        return active;
    }

    public boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public Product getProduct() {
        return product;
    }

    // FIXED: Safe setters to prevent infinite loops
    public void setProduct(Product product) {
        this.product = product;
}
}
