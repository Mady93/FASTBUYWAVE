package com.mady.springboot_be.criteria;

import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * Data Transfer Object for product search criteria.
 * 
 * Used with JPA Specifications (Criteria API) to perform dynamic
 * multi-field filtering on products. The 'type' field is mandatory,
 * all other fields are optional and can be combined.
 * 
 * Supported search filters:
 * - type (mandatory): product category type
 * - country: filter by country
 * - city: filter by city
 * - minPrice/maxPrice: price range filter
 * - title: full-text search with tokenization
 * - condition: product condition (new, used, etc.)
 * - agency: filter by agency status
 * - minDate/maxDate: date range filter
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class ProductSearchCriteriaDTO {

    private String type; // MANDATORY
    private String country;
    private String city;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private String title;
    private String condition;
    private Boolean agency;
    private LocalDate minDate;
    private LocalDate maxDate;

    /**
     * Default constructor.
     */
    public ProductSearchCriteriaDTO() {
    }

    /**
     * Constructs a ProductSearchCriteriaDTO with all fields.
     * 
     * @param type      product category type (mandatory)
     * @param country   filter by country
     * @param city      filter by city
     * @param minPrice  minimum price filter
     * @param maxPrice  maximum price filter
     * @param title     full-text search on title
     * @param condition product condition filter
     * @param agency    filter by agency status
     * @param minDate   minimum date filter
     * @param maxDate   maximum date filter
     */
    public ProductSearchCriteriaDTO(String type, String country, String city, BigDecimal minPrice, BigDecimal maxPrice,
            String title, String condition, Boolean agency, LocalDate minDate, LocalDate maxDate) {
        this.type = type;
        this.country = country;
        this.city = city;
        this.minPrice = minPrice;
        this.maxPrice = maxPrice;
        this.title = title;
        this.condition = condition;
        this.agency = agency;
        this.minDate = minDate;
        this.maxDate = maxDate;
    }

    /**
     * Returns the product category type.
     * 
     * @return the type (mandatory field)
     */
    public String getType() {
        return this.type;
    }

    /**
     * Sets the product category type.
     * 
     * @param type the type to set (mandatory)
     */
    public void setType(String type) {
        this.type = type;
    }

    /**
     * Returns the country filter.
     * 
     * @return the country
     */
    public String getCountry() {
        return this.country;
    }

    /**
     * Sets the country filter.
     * 
     * @param country the country to filter by
     */
    public void setCountry(String country) {
        this.country = country;
    }

    /**
     * Returns the city filter.
     * 
     * @return the city
     */
    public String getCity() {
        return this.city;
    }

    /**
     * Sets the city filter.
     * 
     * @param city the city to filter by
     */
    public void setCity(String city) {
        this.city = city;
    }

    /**
     * Returns the minimum price filter.
     * 
     * @return the minimum price
     */
    public BigDecimal getMinPrice() {
        return this.minPrice;
    }

    /**
     * Sets the minimum price filter.
     * 
     * @param minPrice the minimum price to filter by
     */
    public void setMinPrice(BigDecimal minPrice) {
        this.minPrice = minPrice;
    }

    /**
     * Returns the maximum price filter.
     * 
     * @return the maximum price
     */
    public BigDecimal getMaxPrice() {
        return this.maxPrice;
    }

    /**
     * Sets the maximum price filter.
     * 
     * @param maxPrice the maximum price to filter by
     */
    public void setMaxPrice(BigDecimal maxPrice) {
        this.maxPrice = maxPrice;
    }

    /**
     * Returns the title search term.
     * 
     * @return the title for full-text search
     */
    public String getTitle() {
        return this.title;
    }

    /**
     * Sets the title search term for full-text search.
     * 
     * @param title the title to search for (tokenized)
     */
    public void setTitle(String title) {
        this.title = title;
    }

    /**
     * Returns the product condition filter.
     * 
     * @return the condition (e.g., new, used)
     */
    public String getCondition() {
        return this.condition;
    }

    /**
     * Sets the product condition filter.
     * 
     * @param condition the condition to filter by (e.g., new, used)
     */
    public void setCondition(String condition) {
        this.condition = condition;
    }

    /**
     * Returns the agency status filter.
     * 
     * @return true if agency, false otherwise
     */
    public Boolean isAgency() {
        return this.agency;
    }

    /**
     * Sets the agency status filter.
     * 
     * @param agency true to filter by agency, false otherwise
     */
    public Boolean getAgency() {
        return this.agency;
    }

    /**
     * Sets the agency status filter.
     * 
     * @param agency the agency status to filter by
     */
    public void setAgency(Boolean agency) {
        this.agency = agency;
    }

    /**
     * Returns the minimum date filter.
     * 
     * @return the minimum date
     */
    public LocalDate getMinDate() {
        return this.minDate;
    }

    /**
     * Sets the minimum date filter.
     * 
     * @param minDate the minimum date to filter by
     */
    public void setMinDate(LocalDate minDate) {
        this.minDate = minDate;
    }

    /**
     * Returns the maximum date filter.
     * 
     * @return the maximum date
     */
    public LocalDate getMaxDate() {
        return this.maxDate;
    }

    /**
     * Sets the maximum date filter.
     * 
     * @param maxDate the maximum date to filter by
     */
    public void setMaxDate(LocalDate maxDate) {
        this.maxDate = maxDate;
    }

    /**
     * Returns a string representation of the search criteria.
     * 
     * @return string with all search fields
     */
    @Override
    public String toString() {
        return "{" +
                " type='" + getType() + "'" +
                ", country='" + getCountry() + "'" +
                ", city='" + getCity() + "'" +
                ", minPrice='" + getMinPrice() + "'" +
                ", maxPrice='" + getMaxPrice() + "'" +
                ", title='" + getTitle() + "'" +
                ", condition='" + getCondition() + "'" +
                ", agency='" + isAgency() + "'" +
                ", minDate='" + getMinDate() + "'" +
                ", maxDate='" + getMaxDate() + "'" +
                "}";
    }

}
