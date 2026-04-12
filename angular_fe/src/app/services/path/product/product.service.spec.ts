import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ProductService } from './product.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { ProductDTO } from 'src/app/interfaces/dtos/product_dto.interface';
import { ProductSearchCriteriaDTO } from 'src/app/interfaces/dtos/criteria_dto/product_search_criteria_dto.interface';

class MockApiConfigService {
  apiProducts = 'http://localhost:8080/api/products';
}

const mockProduct: ProductDTO = {
  productId: 1,
  price: 99.99,
  active: true,
  condition: 'NEW',
  stockQuantity: 5,
};

describe('ProductService', () => {
  let service: ProductService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        ProductService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(ProductService);
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
  // getActiveProductsByUserId
  // ============================================

  describe('getActiveProductsByUserId', () => {
    it('should GET active products for a user', () => {
      service.getActiveProductsByUserId(1).subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].productId).toBe(1);
        expect(result[0].active).toBeTrue();
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/getProduct/active/1'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockProduct]);
    });

    it('should return empty array when user has no active products', () => {
      service.getActiveProductsByUserId(99).subscribe((result) => {
        expect(result.length).toBe(0);
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/getProduct/active/99'
      );
      req.flush([]);
    });

    it('should use correct URL with different user ID', () => {
      service.getActiveProductsByUserId(42).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/getProduct/active/42'
      );
      expect(req.request.method).toBe('GET');
      req.flush([mockProduct]);
    });

    it('should handle 404 error', () => {
      service.getActiveProductsByUserId(1).subscribe({
        error: (err) => expect(err.status).toBe(404),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/getProduct/active/1'
      );
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should handle 500 error', () => {
      service.getActiveProductsByUserId(1).subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/getProduct/active/1'
      );
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });

  // ============================================
  // getProductsNotDeletedByType
  // ============================================

  describe('getProductsNotDeletedByType', () => {
    it('should POST criteria and return matching products', () => {
      const criteria: ProductSearchCriteriaDTO = {
        type: 'electronics',
      };

      service.getProductsNotDeletedByType(criteria).subscribe((result) => {
        expect(result.length).toBe(1);
        expect(result[0].condition).toBe('NEW');
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/list/not/delete'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(criteria);
      req.flush([mockProduct]);
    });

    it('should POST full criteria with all optional fields', () => {
      const criteria: ProductSearchCriteriaDTO = {
        type: 'electronics',
        country: 'Italy',
        city: 'Rome',
        minPrice: 10,
        maxPrice: 500,
        title: 'laptop',
        condition: 'NEW',
        agency: 'false',
      };

      service.getProductsNotDeletedByType(criteria).subscribe((result) => {
        expect(result).toBeTruthy();
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/list/not/delete'
      );
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(criteria);
      req.flush([mockProduct]);
    });

    it('should return empty array when no products match criteria', () => {
      const criteria: ProductSearchCriteriaDTO = { type: 'unknown' };

      service.getProductsNotDeletedByType(criteria).subscribe((result) => {
        expect(result.length).toBe(0);
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/list/not/delete'
      );
      req.flush([]);
    });

    it('should handle 400 error on invalid criteria', () => {
      const criteria: ProductSearchCriteriaDTO = { type: '' };

      service.getProductsNotDeletedByType(criteria).subscribe({
        error: (err) => expect(err.status).toBe(400),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/list/not/delete'
      );
      req.flush('Bad Request', { status: 400, statusText: 'Bad Request' });
    });

    it('should handle 500 error', () => {
      const criteria: ProductSearchCriteriaDTO = { type: 'electronics' };

      service.getProductsNotDeletedByType(criteria).subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/products/list/not/delete'
      );
      req.flush('Server Error', { status: 500, statusText: 'Internal Server Error' });
    });
  });
});