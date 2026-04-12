package com.mady.springboot_be.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.NamedQuery;
import jakarta.persistence.Table;
import jakarta.validation.constraints.NotNull;

@NamedQuery(name = "Address.countByNotDeleted", query = "SELECT count(a) FROM Address a WHERE a.active = true")
@NamedQuery(name = "Address.findByNotDeleted", query = "SELECT a FROM Address a WHERE a.active = true")
@NamedQuery(name = "Address.countByDeleted", query = "SELECT count(a) FROM Address a WHERE a.active = false")
@NamedQuery(name = "Address.findByDeleted", query = "SELECT a FROM Address a WHERE a.active = false")
@NamedQuery(name = "Address.findByIdByNotDeleted", query = "SELECT a FROM Address a WHERE a.addressId = :id AND a.active = true")
@NamedQuery(name = "Address.findByNotDeletedList", query = "SELECT a FROM Address a WHERE a.active = true")
@NamedQuery(name = "Address.findByDeletedList", query = "SELECT a FROM Address a WHERE a.active = false")
@NamedQuery(name = "Address.deactivateById", query = "UPDATE Address p SET p.active = false WHERE p.addressId = :addressId")
@Entity
@Table(name = "address")
public class Address {

    @Id
    @Column(name = "address_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long addressId;

    @NotNull(message = "Street cannot be null")
    @Column(name = "street")
    private String street;

    @NotNull(message = "Street number cannot be null")
    @Column(name = "street_number")
    private String streetNumber;

    
    @Column(name = "province")
    private String province;

    @NotNull(message = "Region cannot be null")
    @Column(name = "region")
    private String region;

    @NotNull(message = "ZIP code cannot be null")
    @Column(name = "zip_code")
    private String zipCode;

    @NotNull(message = "City cannot be null")
    @Column(name = "city")
    private String city;

    @NotNull(message = "Country cannot be null")
    @Column(name = "country")
    private String country;

    @Column(name = "latitude")
    private double latitude;

    @Column(name = "longitude")
    private double longitude;


    @Column(name = "active")
    private boolean active;

    public Address() {
    }

    public Address(String street, String streetNumber, String zipCode, String region, String province, String city,
    String country, double latitude, double longitude) {
        this.street = street;
        this.streetNumber = streetNumber;
        this.zipCode = zipCode;
        this.region = region;
        this.province = province;
        this.city = city;
         this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;

        this.active = true;
    }

    public Long getAddressId() {
        return addressId;
    }

    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    public String getStreet() {
        return street;
    }

    public void setStreet(String street) {
        this.street = street;
    }

    public String getStreetNumber() {
        return streetNumber;
    }

    public void setStreetNumber(String streetNumber) {
        this.streetNumber = streetNumber;
    }

    public String getProvince() {
        return province;
    }

    public void setProvince(String province) {
        this.province = province;
    }

    public String getRegion() {
        return region;
    }

    public void setRegion(String region) {
        this.region = region;
    }

    public String getZipCode() {
        return zipCode;
    }

    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public double getLatitude() {
        return latitude;
    }

    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    public double getLongitude() {
        return longitude;
    }

    public void setLongitude(double longitude) {
        this.longitude = longitude;
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


    public String getCountry() {
        return this.country;
    }

    public void setCountry(String country) {
        this.country = country;
    }


    // Metodo toString

    @Override
    public String toString() {
        return "Address{" +
                "addressId=" + addressId +
                ", street='" + street + '\'' +
                ", streetNumber='" + streetNumber + '\'' +
                ", province='" + province + '\'' +
                ", region='" + region + '\'' +
                ", zipCode='" + zipCode + '\'' +
                ", city='" + city + '\'' +
                ", country=" + country + '\'' +
                ", latitude=" + latitude +
                ", longitude=" + longitude +
                 ", active=" + active +
                '}';
    }
}