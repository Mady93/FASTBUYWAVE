package com.mady.springboot_be.entities.contact;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import com.mady.springboot_be.entities.User;
import com.mady.springboot_be.enums.contact.ProposalStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "appointment_proposals")
public class AppointmentProposal {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long proposalId;

    @ManyToOne
    @JoinColumn(name = "appointment_id")
    private Appointment appointment;

    @ManyToOne
    @JoinColumn(name = "proposed_by_user_id")
    private User proposedBy;

    private LocalDateTime proposedDatetime;

    private String proposedLocationAddress;

    private String proposedLocationNotes;

    private Integer proposedDuration;

    @Enumerated(EnumType.STRING)
    private ProposalStatus status;

    private LocalDateTime createdAt;

    @Column(name = "latitude", precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(name = "longitude", precision = 11, scale = 8)
    private BigDecimal longitude;

    public AppointmentProposal() {
    }

    public AppointmentProposal(Long proposalId, Appointment appointment, User proposedBy, LocalDateTime proposedDatetime, String proposedLocationAddress, String proposedLocationNotes, Integer proposedDuration, ProposalStatus status, LocalDateTime createdAt, BigDecimal latitude, BigDecimal longitude) {
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

    public Long getProposalId() {
        return this.proposalId;
    }

    public void setProposalId(Long proposalId) {
        this.proposalId = proposalId;
    }

    public Appointment getAppointment() {
        return this.appointment;
    }

    public void setAppointment(Appointment appointment) {
        this.appointment = appointment;
    }

    public User getProposedBy() {
        return this.proposedBy;
    }

    public void setProposedBy(User proposedBy) {
        this.proposedBy = proposedBy;
    }

    public LocalDateTime getProposedDatetime() {
        return this.proposedDatetime;
    }

    public void setProposedDatetime(LocalDateTime proposedDatetime) {
        this.proposedDatetime = proposedDatetime;
    }

    public String getProposedLocationAddress() {
        return this.proposedLocationAddress;
    }

    public void setProposedLocationAddress(String proposedLocationAddress) {
        this.proposedLocationAddress = proposedLocationAddress;
    }

    public String getProposedLocationNotes() {
        return this.proposedLocationNotes;
    }

    public void setProposedLocationNotes(String proposedLocationNotes) {
        this.proposedLocationNotes = proposedLocationNotes;
    }

    public Integer getProposedDuration() {
        return this.proposedDuration;
    }

    public void setProposedDuration(Integer proposedDuration) {
        this.proposedDuration = proposedDuration;
    }

    public ProposalStatus getStatus() {
        return this.status;
    }

    public void setStatus(ProposalStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return this.createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public BigDecimal getLatitude() {
        return this.latitude;
    }

    public void setLatitude(BigDecimal latitude) {
        this.latitude = latitude;
    }

    public BigDecimal getLongitude() {
        return this.longitude;
    }

    public void setLongitude(BigDecimal longitude) {
        this.longitude = longitude;
    }

    public AppointmentProposal proposalId(Long proposalId) {
        setProposalId(proposalId);
        return this;
    }

    public AppointmentProposal appointment(Appointment appointment) {
        setAppointment(appointment);
        return this;
    }

    public AppointmentProposal proposedBy(User proposedBy) {
        setProposedBy(proposedBy);
        return this;
    }

    public AppointmentProposal proposedDatetime(LocalDateTime proposedDatetime) {
        setProposedDatetime(proposedDatetime);
        return this;
    }

    public AppointmentProposal proposedLocationAddress(String proposedLocationAddress) {
        setProposedLocationAddress(proposedLocationAddress);
        return this;
    }

    public AppointmentProposal proposedLocationNotes(String proposedLocationNotes) {
        setProposedLocationNotes(proposedLocationNotes);
        return this;
    }

    public AppointmentProposal proposedDuration(Integer proposedDuration) {
        setProposedDuration(proposedDuration);
        return this;
    }

    public AppointmentProposal status(ProposalStatus status) {
        setStatus(status);
        return this;
    }

    public AppointmentProposal createdAt(LocalDateTime createdAt) {
        setCreatedAt(createdAt);
        return this;
    }

    public AppointmentProposal latitude(BigDecimal latitude) {
        setLatitude(latitude);
        return this;
    }

    public AppointmentProposal longitude(BigDecimal longitude) {
        setLongitude(longitude);
        return this;
    }

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