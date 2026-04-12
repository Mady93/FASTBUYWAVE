import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdvetisementService } from './advetisement.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { AdvertisementDTO } from 'src/app/interfaces/dtos/advertisement_dto.interface';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { ApiResponse } from 'src/app/interfaces/dettails/api_response';

class MockApiConfigService {
  apiAdvertisements = 'http://localhost:8080/api/advertisements';
}

const mockAdvertisement: AdvertisementDTO = {
  title: 'Test Ad',
  description: 'Test description',
  status: 'ACTIVE',
  createdAt: '2026-01-01T00:00:00Z',
  type: 'SELL',
  agency: false,
  agencyName: '',
  agencyFeePercent: 0,
  agencyUrl: '',
  active: true,
};

const mockProduct: ProductDTO = {
  price: 100,
  active: true,
  condition: 'NEW',
  stockQuantity: 5,
};

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

const mockCategory: CategoryDTO = {
  categoryId: 1,
  label: 'Electronics',
  icon: 'electronics-icon',
  active: true,
  link: '/electronics',
  name: 'Electronics',
  parent: null,
  children: [],
};

const mockApiResponse: ApiResponse = {
  status: 200,
  message: 'Advertisement created successfully',
};

describe('AdvetisementService', () => {
  let service: AdvetisementService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        AdvetisementService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(AdvetisementService);
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
  // createAdvertisement
  // ============================================

  it('should create an advertisement with multipart/form-data', () => {
    const images = [
      new File(['content'], 'image1.jpg', { type: 'image/jpeg' }),
    ];

    service
      .createAdvertisement(
        mockAdvertisement,
        mockProduct,
        mockAddress,
        mockCategory,
        images,
        1,
      )
      .subscribe((result) => {
        expect(result).toEqual(mockApiResponse);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/advertisements/create' &&
        r.params.get('userId') === '1',
    );
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockApiResponse);
  });

  it('should include userId as query param', () => {
    const images: File[] = [];

    service
      .createAdvertisement(
        mockAdvertisement,
        mockProduct,
        mockAddress,
        mockCategory,
        images,
        42,
      )
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/advertisements/create',
    );
    expect(req.request.params.get('userId')).toBe('42');
    req.flush(mockApiResponse);
  });

  it('should append images to FormData', () => {
    const images = [
      new File(['img1'], 'photo1.jpg', { type: 'image/jpeg' }),
      new File(['img2'], 'photo2.jpg', { type: 'image/jpeg' }),
    ];

    service
      .createAdvertisement(
        mockAdvertisement,
        mockProduct,
        mockAddress,
        mockCategory,
        images,
        1,
      )
      .subscribe();

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/advertisements/create',
    );
    const formData: FormData = req.request.body;
    expect(formData.getAll('images').length).toBe(2);
    req.flush(mockApiResponse);
  });

  it('should still create advertisement without images', () => {
    service
      .createAdvertisement(
        mockAdvertisement,
        mockProduct,
        mockAddress,
        mockCategory,
        [],
        1,
      )
      .subscribe((result) => {
        expect(result.status).toBe(200);
      });

    const req = httpMock.expectOne(
      (r) => r.url === 'http://localhost:8080/api/advertisements/create',
    );
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockApiResponse);
  });

  // ============================================
  // renewAdvertisement
  // ============================================

  it('should renew an advertisement', () => {
    service.renewAdvertisement(mockAdvertisement).subscribe((result) => {
      expect(result).toEqual(mockAdvertisement);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/advertisements/renew',
    );
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(mockAdvertisement);
    req.flush(mockAdvertisement);
  });

  it('should handle error on renewAdvertisement', () => {
    service.renewAdvertisement(mockAdvertisement).subscribe({
      error: (err) => {
        expect(err.status).toBe(404);
      },
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/advertisements/renew',
    );
    req.flush(
      { message: 'Not found' },
      { status: 404, statusText: 'Not Found' },
    );
  });
});
