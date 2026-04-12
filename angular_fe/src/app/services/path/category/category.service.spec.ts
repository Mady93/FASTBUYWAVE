import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { CategoryService } from './category.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { CategoryDTO } from 'src/app/interfaces/dtos/category_dto.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { skip } from 'rxjs';

class MockApiConfigService {
  apiCategory = 'http://localhost:8080/api/category';
}

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

const mockPageable: Pageable = {
  page: 0,
  size: 10,
  sort: 'categoryId,asc',
};

const mockPageResponse: PageResponse<CategoryDTO> = {
  content: [mockCategory],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  numberOfElements: 1,
};

describe('CategoryService', () => {
  let service: CategoryService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        CategoryService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(CategoryService);
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
  // notifyCategoriesUpdate
  // ============================================

  it('should emit on categoriesUpdated$ when notified', (done) => {
    service.categoriesUpdated$.pipe(skip(1)).subscribe(() => {
      done();
    });
    service.notifyCategoriesUpdate();
  });

  // ============================================
  // createCategory
  // ============================================

  it('should POST to create a category', () => {
    service.createCategory(mockCategory).subscribe((result) => {
      expect(result).toEqual(mockCategory);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/category/create');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCategory);
    req.flush(mockCategory);
  });

  // ============================================
  // getCategoryById
  // ============================================

  it('should GET a category by id', () => {
    service.getCategoryById(1).subscribe((result) => {
      expect(result).toEqual(mockCategory);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/category/get/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  // ============================================
  // getCategoryByType
  // ============================================

  it('should GET a category by type', () => {
    service.getCategoryByType('ELECTRONICS').subscribe((result) => {
      expect(result).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/get/type/ELECTRONICS',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  // ============================================
  // existsByType
  // ============================================

  it('should GET true when category type exists', () => {
    service.existsByType('ELECTRONICS').subscribe((result) => {
      expect(result).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/exists/type/ELECTRONICS',
    );
    expect(req.request.method).toBe('GET');
    req.flush(true);
  });

  it('should GET false when category type does not exist', () => {
    service.existsByType('UNKNOWN').subscribe((result) => {
      expect(result).toBeFalse();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/exists/type/UNKNOWN',
    );
    req.flush(false);
  });

  // ============================================
  // getAllActiveCategories
  // ============================================

  it('should GET all active categories', () => {
    service.getAllActiveCategories().subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0]).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/get/active',
    );
    expect(req.request.method).toBe('GET');
    req.flush([mockCategory]);
  });

  // ============================================
  // getActiveCategoriesPaginated
  // ============================================

  it('should GET active categories paginated', () => {
    service.getActiveCategoriesPaginated(mockPageable).subscribe((result) => {
      expect(result.content.length).toBe(1);
      expect(result.totalElements).toBe(1);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/category/active/paginated' &&
        r.params.get('page') === '0' &&
        r.params.get('size') === '10' &&
        r.params.get('sort') === 'categoryId,asc',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPageResponse);
  });

  it('should use default sort when not provided', () => {
    const pageableNoSort: Pageable = { page: 0, size: 5 };

    service.getActiveCategoriesPaginated(pageableNoSort).subscribe();

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/category/active/paginated' &&
        r.params.get('sort') === 'categoryId,asc',
    );
    expect(req.request.params.get('sort')).toBe('categoryId,asc');
    req.flush(mockPageResponse);
  });

  // ============================================
  // getNotActiveCategoriesPaginated
  // ============================================

  it('should GET inactive categories paginated', () => {
    service
      .getNotActiveCategoriesPaginated(mockPageable)
      .subscribe((result) => {
        expect(result.totalElements).toBe(1);
      });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/category/not/active/paginated' &&
        r.params.get('page') === '0',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockPageResponse);
  });

  // ============================================
  // updateCategory
  // ============================================

  it('should PUT to update a category', () => {
    const updated = { ...mockCategory, label: 'Updated Electronics' };

    service.updateCategory(updated).subscribe((result) => {
      expect(result.label).toBe('Updated Electronics');
    });

    const req = httpMock.expectOne('http://localhost:8080/api/category/update');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updated);
    req.flush(updated);
  });

  // ============================================
  // deleteCategory
  // ============================================

  it('should DELETE a category by id', () => {
    service.deleteCategory(1).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/delete/1',
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ============================================
  // deleteChildByCategoryId
  // ============================================

  it('should DELETE a child category', () => {
    service.deleteChildByCategoryId(1, 2).subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/delete/1/child/2',
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ============================================
  // deleteAllCategories
  // ============================================

  it('should DELETE all categories', () => {
    service.deleteAllCategories().subscribe(() => {
      expect(true).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/delete/all',
    );
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  // ============================================
  // activateAllCategories / deactivateAllCategories
  // ============================================

  it('should PUT to activate all categories', () => {
    service.activateAllCategories().subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].active).toBeTrue();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/activate/all',
    );
    expect(req.request.method).toBe('PUT');
    req.flush([mockCategory]);
  });

  it('should PUT to deactivate all categories', () => {
    const deactivated = { ...mockCategory, active: false };

    service.deactivateAllCategories().subscribe((result) => {
      expect(result[0].active).toBeFalse();
    });

    const req = httpMock.expectOne(
      'http://localhost:8080/api/category/deactivate/all',
    );
    expect(req.request.method).toBe('PUT');
    req.flush([deactivated]);
  });

  // ============================================
  // getCategoryByPath
  // ============================================

  it('should GET a category by path', () => {
    service.getCategoryByPath('/electronics').subscribe((result) => {
      expect(result).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/category/get/path' &&
        r.params.get('path') === '/electronics',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });

  // ============================================
  // getCategoryByLink
  // ============================================

  it('should GET a category by link', () => {
    service.getCategoryByLink('/electronics').subscribe((result) => {
      expect(result).toEqual(mockCategory);
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url === 'http://localhost:8080/api/category/get/link' &&
        r.params.get('link') === '/electronics',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCategory);
  });
});
