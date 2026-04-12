import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { UserService } from './user.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { UserDTO } from 'src/app/interfaces/dtos/user_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';
import { Pageable } from 'src/app/interfaces/page/pageable.interface';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockUser: UserDTO = {
  userId: 1,
  email: 'mario.rossi@example.com',
  roles: 'BUYER',
  registrationDate: new Date('2023-01-01'),
  lastLogin: new Date('2024-01-01'),
  active: true,
};

const mockPageResponse: PageResponse<UserDTO> = {
  content: [mockUser],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  numberOfElements: 1,
};

const mockPageable: Pageable = {
  page: 0,
  size: 10,
  sort: 'email,asc',
};

// ─── Mock ApiConfigService ────────────────────────────────────────────────────

const mockApiConfig = {
  apiUser: 'http://localhost:8080/api/users',
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;
  const BASE = mockApiConfig.apiUser;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        UserService,
        { provide: ApiConfigService, useValue: mockApiConfig },
      ],
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    // Verifica che non ci siano request HTTP pendenti non gestite
    httpMock.verify();
  });

  // ── Creazione ──────────────────────────────────────────────────────────────

  it('dovrebbe essere creato', () => {
    expect(service).toBeTruthy();
  });

  // ── getUserByEmail ─────────────────────────────────────────────────────────

  describe('getUserByEmail()', () => {
    it('dovrebbe inviare una GET con il parametro email e ritornare lo UserDTO', () => {
      service.getUserByEmail('mario.rossi@example.com').subscribe((res) => {
        expect(res).toEqual(mockUser);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE}/email` &&
          r.params.get('email') === 'mario.rossi@example.com',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  // ── countUsers ─────────────────────────────────────────────────────────────

  describe('countUsers()', () => {
    it('dovrebbe inviare una GET su /count e ritornare il numero di utenti attivi', () => {
      service.countUsers().subscribe((count) => {
        expect(count).toBe(42);
      });

      const req = httpMock.expectOne(`${BASE}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(42);
    });
  });

  // ── getUsers ───────────────────────────────────────────────────────────────

  describe('getUsers()', () => {
    it('dovrebbe inviare una GET su /all con i parametri di paginazione e sort', () => {
      service.getUsers(mockPageable).subscribe((res) => {
        expect(res).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE}/all` &&
          r.params.get('page') === '0' &&
          r.params.get('size') === '10' &&
          r.params.get('sort') === 'email,asc',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });

    it('dovrebbe usare sort vuoto se non fornito', () => {
      const pageableNoSort: Pageable = { page: 0, size: 5 };

      service.getUsers(pageableNoSort).subscribe((res) => {
        expect(res.content.length).toBe(1);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE}/all` &&
          r.params.get('page') === '0' &&
          r.params.get('size') === '5' &&
          r.params.get('sort') === '',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });
  });

  // ── countDeletedUsers ──────────────────────────────────────────────────────

  describe('countDeletedUsers()', () => {
    it('dovrebbe inviare una GET su /count-deleted e ritornare il numero di utenti eliminati', () => {
      service.countDeletedUsers().subscribe((count) => {
        expect(count).toBe(3);
      });

      const req = httpMock.expectOne(`${BASE}/count-deleted`);
      expect(req.request.method).toBe('GET');
      req.flush(3);
    });
  });

  // ── getDeletedUsers ────────────────────────────────────────────────────────

  describe('getDeletedUsers()', () => {
    it('dovrebbe inviare una GET su /deleted con i parametri di paginazione', () => {
      service.getDeletedUsers(mockPageable).subscribe((res) => {
        expect(res).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === `${BASE}/deleted` &&
          r.params.get('page') === '0' &&
          r.params.get('size') === '10' &&
          r.params.get('sort') === 'email,asc',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });
  });

  // ── getUserById ────────────────────────────────────────────────────────────

  describe('getUserById()', () => {
    it('dovrebbe inviare una GET su /get/:id e ritornare lo UserDTO', () => {
      service.getUserById(1).subscribe((res) => {
        expect(res).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${BASE}/get/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockUser);
    });
  });

  // ── updateUser ─────────────────────────────────────────────────────────────

  describe('updateUser()', () => {
    it('dovrebbe inviare una PUT con il body aggiornato e ritornare lo UserDTO', () => {
      const updated: UserDTO = { ...mockUser, email: 'nuovo@example.com' };

      service.updateUser(1, updated).subscribe((res) => {
        expect(res.email).toBe('nuovo@example.com');
      });

      const req = httpMock.expectOne(`${BASE}/update/1`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(updated);
      req.flush(updated);
    });
  });

  // ── deleteUser ─────────────────────────────────────────────────────────────

  describe('deleteUser()', () => {
    it('dovrebbe inviare una DELETE su /delete/:id', () => {
      service.deleteUser(1).subscribe();

      const req = httpMock.expectOne(`${BASE}/delete/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ── deleteAllUsers ─────────────────────────────────────────────────────────

  describe('deleteAllUsers()', () => {
    it('dovrebbe inviare una DELETE su /delete/all', () => {
      service.deleteAllUsers().subscribe();

      const req = httpMock.expectOne(`${BASE}/delete/all`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ── reactivateAllUsers ─────────────────────────────────────────────────────

  describe('reactivateAllUsers()', () => {
    it('dovrebbe inviare una PUT su /reactivate/all con body vuoto', () => {
      service.reactivateAllUsers().subscribe();

      const req = httpMock.expectOne(`${BASE}/reactivate/all`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual({});
      req.flush(null);
    });
  });

  // ── getAllActiveUsers ──────────────────────────────────────────────────────

  describe('getAllActiveUsers()', () => {
    it('dovrebbe inviare una GET su /list/active e ritornare un array di UserDTO', () => {
      service.getAllActiveUsers().subscribe((res) => {
        expect(res.length).toBe(1);
        expect(res[0]).toEqual(mockUser);
      });

      const req = httpMock.expectOne(`${BASE}/list/active`);
      expect(req.request.method).toBe('GET');
      req.flush([mockUser]);
    });
  });
});
