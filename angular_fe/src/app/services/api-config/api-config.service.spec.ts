import { TestBed } from '@angular/core/testing';
import { PLATFORM_ID } from '@angular/core';
import { ApiConfigService } from './api-config.service';

describe('ApiConfigService', () => {
  let service: ApiConfigService;

  describe('Browser environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(ApiConfigService);
    });

    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should return base URL', () => {
      expect(service.getBaseUrl()).toBe('http://localhost:8080');
    });

    it('should return apiProducts URL', () => {
      expect(service.apiProducts).toBe('http://localhost:8080/api/products');
    });

    it('should return apiCart URL', () => {
      expect(service.apiCart).toBe('http://localhost:8080/api/v1/cart');
    });
  });

  describe('SSR environment', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
      });
      service = TestBed.inject(ApiConfigService);
    });

    it('should work in SSR', () => {
      expect(service).toBeTruthy();
      expect(service.getBaseUrl()).toBe('http://localhost:8080');
    });
  });

  describe('API endpoints', () => {
    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [{ provide: PLATFORM_ID, useValue: 'browser' }],
      });
      service = TestBed.inject(ApiConfigService);
    });

    it('should return apiUrlClassic', () => {
      expect(service.apiUrlClassic).toContain('/api/auth');
    });

    it('should return apiUrlGoogle', () => {
      expect(service.apiUrlGoogle).toContain('/oauth2');
    });

    it('should return apiLikes', () => {
      expect(service.apiLikes).toContain('/api/likes');
    });

    it('should return apiCategory', () => {
      expect(service.apiCategory).toContain('/api/category');
    });

    it('should return apiUser', () => {
      expect(service.apiUser).toContain('/api/user');
    });

    it('should return apiAddress', () => {
      expect(service.apiAddress).toContain('/api/address');
    });

    it('should return apiAdvertisements', () => {
      expect(service.apiAdvertisements).toContain('/api/advertisements');
    });

    it('should return apiProfile', () => {
      expect(service.apiProfile).toContain('/api/profiles');
    });

    it('should return apiAppointments', () => {
      expect(service.apiAppointments).toContain('/api/appointments');
    });

    it('should return apiChat', () => {
      expect(service.apiChat).toContain('/api/chat');
    });

    it('should return apiContact', () => {
      expect(service.apiContact).toContain('/api/contact/requests');
    });

    it('should return apiComments', () => {
      expect(service.apiComments).toContain('/api/comments');
    });

    it('should return apiOrder', () => {
      expect(service.apiOrder).toContain('/api/v1/orders');
    });

    it('should return apiPayment', () => {
      expect(service.apiPayment).toContain('/api/v1/payments');
    });

    it('should return apiDashboard', () => {
      expect(service.apiDashboard).toContain('/api/dashboard');
    });

    it('should return apiAppointmentProposal', () => {
      expect(service.apiAppointmentProposal).toContain(
        '/api/appointment/proposals',
      );
    });
  });
});
