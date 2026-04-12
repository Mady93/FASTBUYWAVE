import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AddressService } from './address.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';

class MockApiConfigService {
  apiAddress = 'http://localhost:8080/api/address';
}

const mockAddress: AddressDTO = {
  addressId: 1,
  street: 'Via Roma',
  streetNumber: '10',
  province: 'RM',
  region: 'Lazio',
  zipCode: '00100',
  city: 'Rome',
  country: 'Italy',
  latitude: 41.9027835,
  longitude: 12.4963655,
  active: true,
};

const mockPageable: Pageable = {
  page: 0,
  size: 10,
  sort: 'city,asc',
};

describe('AddressService', () => {
  let service: AddressService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        AddressService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(AddressService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  // ============================================
  // CREATION TEST
  // ============================================

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // ============================================
  // CREATE
  // ============================================

  it('should create an address', () => {
    service.create(mockAddress).subscribe((result) => {
      expect(result).toEqual(mockAddress);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/address/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockAddress);
    req.flush(mockAddress);
  });

  // ============================================
  // UPDATE
  // ============================================

  it('should update an address', () => {
    const updated = { ...mockAddress, street: 'Via Napoli' };

    service.update(updated).subscribe((result) => {
      expect(result.street).toBe('Via Napoli');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/address/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush(updated);
  });

  // ============================================
  // DELETE
  // ============================================

  it('should delete an address by id', () => {
    service.delete(1).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/address/delete/1',
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ============================================
  // GET BY ID
  // ============================================

  it('should get an address by id', () => {
    service.getById(1).subscribe((result) => {
      expect(result).toEqual(mockAddress);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/address/get/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockAddress);
  });

  // ============================================
  // GET ALL
  // ============================================

  it('should get all addresses', () => {
    service.getAll().subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockAddress);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/address/get/all');
    expect(req.request.method).toBe('GET');
    req.flush([mockAddress]);
  });

  // ============================================
  // GET ALL ACTIVE / INACTIVE
  // ============================================

  it('should get all active addresses', () => {
    service.getAllActive().subscribe((result) => {
      expect(result).toEqual([mockAddress]);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/address/get/all/active',
    );
    expect(req.request.method).toBe('GET');
    req.flush([mockAddress]);
  });

  it('should get all inactive addresses', () => {
    const inactive = { ...mockAddress, active: false };

    service.getAllInactive().subscribe((result) => {
      expect(result[0].active).toBeFalse();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/address/get/all/inactive',
    );
    expect(req.request.method).toBe('GET');
    req.flush([inactive]);
  });

  // ============================================
  // PAGINATED
  // ============================================

  it('should get active addresses paginated', () => {
    const mockPage = {
      content: [mockAddress],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
    };

    service.getActivePaginated(mockPageable).subscribe((result) => {
      expect(result.content.length).toBe(1);
      expect(result.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url ===
          'http://localhost:8080/api/address/get/all/active/paginated' &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10' &&
        r.params.get('sort') === 'city,asc',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  it('should get inactive addresses paginated', () => {
    const mockPage = {
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 10,
      number: 0,
    };

    service.getInactivePaginated(mockPageable).subscribe((result) => {
      expect(result.totalElements).toBe(0);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url ===
          'http://localhost:8080/api/address/get/all/inactive/paginated' &&
        r.params.get('page') === '0',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPage);
  });

  // ============================================
  // COUNT
  // ============================================

  it('should count active addresses', () => {
    service.countActive().subscribe((result) => {
      expect(result).toBe(5);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/address/count/active',
    );
    expect(req.request.method).toBe('GET');
    req.flush(5);
  });

  it('should count inactive addresses', () => {
    service.countInactive().subscribe((result) => {
      expect(result).toBe(3);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/address/count/inactive',
    );
    expect(req.request.method).toBe('GET');
    req.flush(3);
  });
});
