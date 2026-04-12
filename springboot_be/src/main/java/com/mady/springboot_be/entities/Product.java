package com.mady.springboot_be.entities;

import java.math.BigDecimal;
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
import jakarta.persistence.NamedQuery;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Pattern;

@NamedQuery(name = "Product.countByNotDeleted", query = "SELECT count(p) FROM Product p WHERE p.active = true")
@NamedQuery(name = "Product.findByIdByNotDeleted", query = "SELECT p FROM Product p WHERE p.productId = :productId AND p.active = true")
@NamedQuery(name = "Product.countByDeleted", query = "SELECT count(p) FROM Product p WHERE p.active = false")
@NamedQuery(
    name = "Product.findByNotDeletedList", 
    query = "SELECT p FROM Product p " +
            "JOIN FETCH p.advertisement a " +    
            "JOIN FETCH a.createdBy " +           
            "WHERE p.active = true"
)
@NamedQuery(
    name = "Product.findByNotDeletedAndAdvertisementType",
    query = "SELECT p FROM Product p " +
            "JOIN FETCH p.advertisement a " +
            "JOIN FETCH a.createdBy " +
            "WHERE p.active = true AND a.type = :adType"
)
@NamedQuery(name = "Product.findByDeletedList", query = "SELECT p FROM Product p WHERE p.active = false")
@NamedQuery(name = "Product.findByUserId", 
    query = "SELECT p FROM Product p WHERE p.advertisement.createdBy.userId = :userId AND p.active = true")

@NamedQuery(
    name = "Product.findByIdWithActiveImages",
    query = "SELECT p FROM Product p " +
            "LEFT JOIN FETCH p.images i " +
            "WHERE p.productId = :productId " +
            "AND p.active = true " +
            "AND (i IS NULL OR i.active = true)"
)
@Valid
@Table(name = "products")
@Entity
public class Product {

    @Id
    @Column(name = "product_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @Column(name = "price", columnDefinition = "DECIMAL(10,2)")
    private BigDecimal price;

    @Pattern(regexp = "^(NEW|USED)$", message = "Condition must be one of: NEW, USED")
	@Column(name = "product_condition", length = 4, nullable = false)
    private String condition;

    @Column(name = "stock_quantity", nullable = false)
    private Integer stockQuantity;

    @Version
    private Integer version;

    @Column(name = "active")
    private boolean active;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "address", referencedColumnName = "address_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Address address;

    @OneToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "advertisement_id", referencedColumnName = "advertisement_id", nullable = true)
    private Advertisement advertisement;

    @JsonIgnoreProperties("product")
     @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    @JsonManagedReference
    private List<Image> images = new ArrayList<>();

    public Product() {
    }

    public Product(BigDecimal price, Address address, String condition, Integer stockQuantity) {
        this.price = price;
        this.address = address;
        this.active = true;
        this.condition = condition;
        this.stockQuantity = stockQuantity;
    }

    // Getters and Setters
    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
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

    public Address getAddress() {
        return address;
    }

    public void setAddress(Address address) {
        this.address = address;
    }

    public Advertisement getAdvertisement() {
        return advertisement;
    }

    public void setAdvertisement(Advertisement advertisement) {
        this.advertisement = advertisement;
    }

    public List<Image> getImages() {
        return images;
    }

    public void setImages(List<Image> images) {
        this.images = images;
    }

    // FIXED: Safe bidirectional relationship management
     public void addImage(Image image) {
        if (image != null && !images.contains(image)) {
            images.add(image);
            image.setProduct(this); // Use internal setter
        }
    }
    
    public void removeImage(Image image) {
        if (image != null && images.contains(image)) {
            images.remove(image);
            image.setProduct(null);
        }
    }


    public String getCondition() {
        return this.condition;
    }

    public void setCondition(String condition) {
        this.condition = condition;
    }

    public Integer getStockQuantity() {
    return stockQuantity;
}

public void setStockQuantity(Integer stockQuantity) {
    if (stockQuantity < 0) throw new IllegalArgumentException("Quantity cannot be negative");
    this.stockQuantity = stockQuantity;
}

public void decreaseStock(int quantity) {
    if (quantity > this.stockQuantity) {
        throw new IllegalArgumentException("Not enough stock available");
    }
    this.stockQuantity -= quantity;
    if (this.stockQuantity == 0) {
        this.active = false;
    }
}

    public Integer getVersion() {
        return this.version;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }


    // toString
    @Override
    public String toString() {
        return "Product{" +
                "productId=" + productId +
                ", price=" + price +
                ", active=" + active +
                ", address=" + (address != null ? address.getAddressId() : "null") +
                ", advertisement=" + (advertisement != null ? advertisement.getAdvertisementId() : "null") +
                ", imagesCount=" + (images != null ? images.size() : 0) +
                ", condition=" + condition +
                ", stockQuantity=" + stockQuantity +
                ", version=" + version +
                '}';
    }

}
