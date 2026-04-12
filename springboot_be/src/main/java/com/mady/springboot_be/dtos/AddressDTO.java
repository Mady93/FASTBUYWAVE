package com.mady.springboot_be.dtos;

import java.io.Serializable;

/**
 * Data Transfer Object for address information.
 * 
 * Contains complete address details including street, city, country,
 * geographic coordinates (latitude/longitude), and active status.
 * 
 * Used for:
 * - Product locations
 * - User profile addresses
 * - Shipping addresses for orders
 * - Appointment locations
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AddressDTO implements Serializable {

    private static final long serialVersionUID = 202504220007L;

    private Long addressId;
    private String street;
    private String streetNumber;
    private String province;
    private String region;
    private String zipCode;
    private String city;
    private String country;
    private double latitude;
    private double longitude;
    private boolean active;

    /**
     * Default constructor.
     */
    public AddressDTO() {
    }

    /**
     * Constructs an AddressDTO with all fields (active defaults to true).
     * 
     * @param addressId    the address ID
     * @param street       the street name
     * @param streetNumber the street number
     * @param province     the province
     * @param region       the region
     * @param zipCode      the postal/ZIP code
     * @param city         the city
     * @param country      the country
     * @param latitude     geographic latitude
     * @param longitude    geographic longitude
     */
    public AddressDTO(Long addressId, String street, String streetNumber, String province, String region,
            String zipCode,
            String city, String country, double latitude, double longitude) {
        this.addressId = addressId;
        this.street = street;
        this.streetNumber = streetNumber;
        this.province = province;
        this.region = region;
        this.zipCode = zipCode;
        this.city = city;
        this.country = country;
        this.latitude = latitude;
        this.longitude = longitude;
        this.active = true;
    }

    /**
     * Returns the address ID.
     * 
     * @return the address ID
     */
    public Long getAddressId() {
        return addressId;
    }

    /**
     * Sets the address ID.
     * 
     * @param addressId the address ID to set
     */
    public void setAddressId(Long addressId) {
        this.addressId = addressId;
    }

    /**
     * Returns the street name.
     * 
     * @return the street name
     */
    public String getStreet() {
        return street;
    }

    /**
     * Sets the street name.
     * 
     * @param street the street name to set
     */
    public void setStreet(String street) {
        this.street = street;
    }

    /**
     * Returns the street number.
     * 
     * @return the street number
     */
    public String getStreetNumber() {
        return streetNumber;
    }

    /**
     * Sets the street number.
     * 
     * @param streetNumber the street number to set
     */
    public void setStreetNumber(String streetNumber) {
        this.streetNumber = streetNumber;
    }

    /**
     * Returns the province.
     * 
     * @return the province
     */
    public String getProvince() {
        return province;
    }

    /**
     * Sets the province.
     * 
     * @param province the province to set
     */
    public void setProvince(String province) {
        this.province = province;
    }

    /**
     * Returns the region.
     * 
     * @return the region
     */
    public String getRegion() {
        return region;
    }

    /**
     * Sets the region.
     * 
     * @param region the region to set
     */
    public void setRegion(String region) {
        this.region = region;
    }

    /**
     * Returns the postal/ZIP code.
     * 
     * @return the zip code
     */
    public String getZipCode() {
        return zipCode;
    }

    /**
     * Sets the postal/ZIP code.
     * 
     * @param zipCode the zip code to set
     */
    public void setZipCode(String zipCode) {
        this.zipCode = zipCode;
    }

    /**
     * Returns the city.
     * 
     * @return the city
     */
    public String getCity() {
        return city;
    }

    /**
     * Sets the city.
     * 
     * @param city the city to set
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * Returns the geographic latitude.
     * 
     * @return the latitude
     */
    public double getLatitude() {
        return latitude;
    }

    /**
     * Sets the geographic latitude.
     * 
     * @param latitude the latitude to set
     */
    public void setLatitude(double latitude) {
        this.latitude = latitude;
    }

    /**
     * Returns the geographic longitude.
     * 
     * @return the longitude
     */
    public double getLongitude() {
        return longitude;
    }

    /**
     * Sets the geographic longitude.
     * 
     * @param longitude the longitude to set
     */
    public void setLongitude(double longitude) {
        this.longitude = longitude;
    }

    /**
     * Returns whether the address is active.
     * 
     * @return true if active, false otherwise
     */
    public boolean isActive() {
        return active;
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
     * Returns the country.
     * 
     * @return the country
     */
    public String getCountry() {
        return this.country;
    }

    /**
     * Sets the country.
     * 
     * @param country the country to set
     */
    public void setCountry(String country) {
        this.country = country;
    }

    /**
     * Returns whether the address is active (getter for frameworks).
     * 
     * @return true if active, false otherwise
     */
    public boolean getActive() {
        return this.active;
    }

    /**
     * Returns a string representation of the AddressDTO.
     * 
     * @return string with all address fields
     */
    @Override
    public String toString() {
        return "AddressDTO{" +
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
