package com.mady.springboot_be.dtos.contact;

import java.io.Serializable;
import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.dtos.UserProfileDTO;
import com.mady.springboot_be.enums.contact.ProposalStatus;

/**
 * Data Transfer Object for appointment change proposals.
 * 
 * Represents a proposal to modify an existing appointment's date, time,
 * location, or duration. Used when one party requests changes to a
 * confirmed or pending appointment.
 * 
 * Proposal status can be:
 * - PENDING: waiting for response
 * - ACCEPTED: proposal accepted, appointment updated
 * - REJECTED: proposal rejected, appointment unchanged
 * 
 * @author Popa Madalina Mariana
 * @since Spring Boot 3.4.4 / Java 21
 */
public class AppointmentProposalDTO implements Serializable {

    // TODO: track last serialized ID
    private static final long serialVersionUID = 2025042200052L;

    private Long proposalId;
    private AppointmentDTO appointment;
    private UserProfileDTO proposedBy;
    private LocalDateTime proposedDatetime;
    private String proposedLocationAddress;
    private String proposedLocationNotes;
    private Integer proposedDuration;
    private ProposalStatus status;
    private LocalDateTime createdAt;
    private BigDecimal latitude;
    private BigDecimal longitude;

    /**
     * Default constructor.
     */
    public AppointmentProposalDTO() {
    }

    /**
     * Constructs an AppointmentProposalDTO with all fields.
     * 
     * @param proposalId              unique identifier
     * @param appointment             the appointment being modified
     * @param proposedBy              user who proposed the change
     * @param proposedDatetime        proposed new date and time
     * @param proposedLocationAddress proposed new location address
     * @param proposedLocationNotes   proposed location notes
     * @param proposedDuration        proposed new duration in minutes
     * @param status                  proposal status (PENDING, ACCEPTED, REJECTED)
     * @param createdAt               creation timestamp
     * @param latitude                geographic latitude of proposed location
     * @param longitude               geographic longitude of proposed location
     */
    public AppointmentProposalDTO(Long proposalId, AppointmentDTO appointment, UserProfileDTO proposedBy,
            LocalDateTime proposedDatetime, String proposedLocationAddress, String proposedLocationNotes,
            Integer proposedDuration, ProposalStatus status, LocalDateTime createdAt, BigDecimal latitude,
            BigDecimal longitude) {
        this.proposalId = proposalId;
        this.appointment = appointment;
        this.proposedBy = proposedBy;
        this.proposedDatetime = proposedDatetime;
        this.proposedLocationAddress = proposedLocationAddress;
        this.proposedLocationNotes = proposedLocationNotes;
        this.proposedDuration = proposedDuration;
        this.status = status;
        this.createdAt = createdAt;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    /**
     * Returns the proposal ID.
     * 
     * @return the proposal ID
     */
    public Long getProposalId() {
        return this.proposalId;
    }

    /**
     * Sets the proposal ID.
     * 
     * @param proposalId the proposal ID to set
     */
    public void setProposalId(Long proposalId) {
        this.proposalId = proposalId;
    }

    /**
     * Returns the appointment being modified.
     * 
     * @return the appointment
     */
    public AppointmentDTO getAppointment() {
        return this.appointment;
    }

    /**
     * Sets the appointment being modified.
     * 
     * @param appointment the appointment to set
     */
    public void setAppointment(AppointmentDTO appointment) {
        this.appointment = appointment;
    }

    /**
     * Returns the user who proposed the change.
     * 
     * @return the proposer profile
     */
    public UserProfileDTO getProposedBy() {
        return this.proposedBy;
    }

    /**
     * Sets the user who proposed the change.
     * 
     * @param proposedBy the proposer to set
     */
    public void setProposedBy(UserProfileDTO proposedBy) {
        this.proposedBy = proposedBy;
    }

    /**
     * Returns the proposed new date and time.
     * 
     * @return the proposed datetime
     */
    public LocalDateTime getProposedDatetime() {
        return this.proposedDatetime;
    }

    /**
     * Sets the proposed new date and time.
     * 
     * @param proposedDatetime the proposed datetime to set
     */
    public void setProposedDatetime(LocalDateTime proposedDatetime) {
        this.proposedDatetime = proposedDatetime;
    }

    /**
     * Returns the proposed new location address.
     * 
     * @return the proposed address
     */
    public String getProposedLocationAddress() {
        return this.proposedLocationAddress;
    }

    /**
     * Sets the proposed new location address.
     * 
     * @param proposedLocationAddress the address to set
     */
    public void setProposedLocationAddress(String proposedLocationAddress) {
        this.proposedLocationAddress = proposedLocationAddress;
    }

    /**
     * Returns the proposed location notes.
     * 
     * @return the proposed notes
     */
    public String getProposedLocationNotes() {
        return this.proposedLocationNotes;
    }

    /**
     * Sets the proposed location notes.
     * 
     * @param proposedLocationNotes the notes to set
     */
    public void setProposedLocationNotes(String proposedLocationNotes) {
        this.proposedLocationNotes = proposedLocationNotes;
    }

    /**
     * Returns the proposed new duration in minutes.
     * 
     * @return the proposed duration
     */
    public Integer getProposedDuration() {
        return this.proposedDuration;
    }

    /**
     * Sets the proposed new duration in minutes.
     * 
     * @param proposedDuration the duration to set
     */
    public void setProposedDuration(Integer proposedDuration) {
        this.proposedDuration = proposedDuration;
    }

    /**
     * Returns the proposal status.
     * 
     * @return the status (PENDING, ACCEPTED, REJECTED)
     */
    public ProposalStatus getStatus() {
        return this.status;
    }

    /**
     * Sets the proposal status.
     * 
     * @param status the status to set (PENDING, ACCEPTED, REJECTED)
     */
    public void setStatus(ProposalStatus status) {
        this.status = status;
    }

    /**
     * Returns the creation timestamp.
     * 
     * @return the creation timestamp
     */
    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    /**
     * Sets the creation timestamp.
     * 
     * @param createdAt the timestamp to set
     */
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    /**
     * Returns the geographic latitude of proposed location.
     * 
     * @return the latitude
     */
    public BigDecimal getLatitude() {
        return this.latitude;
    }

    /**
     * Sets the geographic latitude of proposed location.
     * 
     * @param latitude the latitude to set
     */
    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    /**
     * Returns the geographic longitude of proposed location.
     * 
     * @return the longitude
     */
    public BigDecimal getLongitude() {
        return this.longitude;
    }

    /**
     * Sets the geographic longitude of proposed location.
     * 
     * @param longitude the longitude to set
     */
    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    /**
     * Fluent setter for proposalId.
     * 
     * @param proposalId the proposal ID
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposalId(Long proposalId) {
        setProposalId(proposalId);
        return this;
    }

    /**
     * Fluent setter for appointment.
     * 
     * @param appointment the appointment
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO appointment(AppointmentDTO appointment) {
        setAppointment(appointment);
        return this;
    }

    /**
     * Fluent setter for proposedBy.
     * 
     * @param proposedBy the proposer
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposedBy(UserProfileDTO proposedBy) {
        setProposedBy(proposedBy);
        return this;
    }

    /**
     * Fluent setter for proposedDatetime.
     * 
     * @param proposedDatetime the proposed datetime
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposedDatetime(LocalDateTime proposedDatetime) {
        setProposedDatetime(proposedDatetime);
        return this;
    }

    /**
     * Fluent setter for proposedLocationAddress.
     * 
     * @param proposedLocationAddress the proposed address
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposedLocationAddress(String proposedLocationAddress) {
        setProposedLocationAddress(proposedLocationAddress);
        return this;
    }

    /**
     * Fluent setter for proposedLocationNotes.
     * 
     * @param proposedLocationNotes the proposed location notes
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposedLocationNotes(String proposedLocationNotes) {
        setProposedLocationNotes(proposedLocationNotes);
        return this;
    }

    /**
     * Fluent setter for proposedDuration.
     * 
     * @param proposedDuration the proposed duration in minutes
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO proposedDuration(Integer proposedDuration) {
        setProposedDuration(proposedDuration);
        return this;
    }

    /**
     * Fluent setter for status.
     * 
     * @param status the proposal status
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO status(ProposalStatus status) {
        setStatus(status);
        return this;
    }

    /**
     * Fluent setter for createdAt.
     * 
     * @param createdAt the creation timestamp
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO createdAt(LocalDateTime createdAt) {
        setCreatedAt(createdAt);
        return this;
    }

    /**
     * Fluent setter for latitude.
     * 
     * @param latitude the geographic latitude
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO latitude(BigDecimal latitude) {
        setLatitude(latitude);
        return this;
    }

    /**
     * Fluent setter for longitude.
     * 
     * @param longitude the geographic longitude
     * @return this instance for method chaining
     */
    public AppointmentProposalDTO longitude(BigDecimal longitude) {
        setLongitude(longitude);
        return this;
    }

    /**
     * Returns a string representation of the AppointmentProposalDTO.
     * 
     * @return string with all proposal fields
     */
    @Override
    public String toString() {
        return "{" +
                " proposalId='" + getProposalId() + "'" +
                ", appointment='" + getAppointment() + "'" +
                ", proposedBy='" + getProposedBy() + "'" +
                ", proposedDatetime='" + getProposedDatetime() + "'" +
                ", proposedLocationAddress='" + getProposedLocationAddress() + "'" +
                ", proposedLocationNotes='" + getProposedLocationNotes() + "'" +
                ", proposedDuration='" + getProposedDuration() + "'" +
                ", status='" + getStatus() + "'" +
                ", createdAt='" + getCreatedAt() + "'" +
                ", latitude='" + getLatitude() + "'" +
                ", longitude='" + getLongitude() + "'" +
                "}";
    }

}