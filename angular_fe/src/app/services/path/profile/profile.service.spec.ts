import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';

import { ProfileService } from './profile.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { ProfileDTO } from 'src/app/interfaces/dtos/profile_dto.interface';
import { AddressDTO } from 'src/app/interfaces/dtos/adress_dto.interface';
import { PageResponse } from 'src/app/interfaces/page/page_response.interface';

// ─── Mock data ────────────────────────────────────────────────────────────────

const mockAddress: AddressDTO = {
  street: 'Via Roma',
  streetNumber: '1',
  province: 'RM',
  region: 'Lazio',
  zipCode: '00100',
  city: 'Roma',
  country: 'Italy',
  latitude: 41.9028,
  longitude: 12.4964,
  active: true,
};

const mockProfile: ProfileDTO = {
  profileId: 1,
  firstName: 'Mario',
  lastName: 'Rossi',
  dateOfBirth: '1990-01-01T00:00:00',
  gender: 'MALE',
  phoneNumber: '+39 06 12345678',
  address: mockAddress,
  userType: 'BUYER',
  securityQuestion: 'Qual è il nome del tuo primo animale?',
  securityAnswer: 'Fido',
  newsletterSubscription: false,
  preferredLanguage: 'it',
  currency: 'EUR',
  active: true,
  notificationPreferences: ['EMAIL'],
  privacySettings: ['PUBLIC'],
};

const mockPageResponse: PageResponse<ProfileDTO> = {
  content: [mockProfile],
  pageNumber: 0,
  pageSize: 10,
  totalElements: 1,
  totalPages: 1,
  first: true,
  last: true,
  numberOfElements: 1,
};

// ─── Mock ApiConfigService ────────────────────────────────────────────────────

const mockApiConfig = {
  apiProfile: 'http://localhost:8080/api/profiles',
};

// ─── Suite ────────────────────────────────────────────────────────────────────

describe('ProfileService', () => {
  let service: ProfileService;
  let httpMock: HttpTestingController;
  const BASE = mockApiConfig.apiProfile;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ProfileService,
        { provide: ApiConfigService, useValue: mockApiConfig },
      ],
    });

    service = TestBed.inject(ProfileService);
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

  // ── BehaviorSubject / Observable ───────────────────────────────────────────

  describe('profileUpdated$', () => {
    it('dovrebbe emettere null inizialmente', (done) => {
      service.profileUpdated$.subscribe((val) => {
        expect(val).toBeNull();
        done();
      });
    });

    it('dovrebbe emettere il profilo aggiornato dopo notifyProfileUpdated()', (done) => {
      service.notifyProfileUpdated(mockProfile);
      service.profileUpdated$.subscribe((val) => {
        expect(val).toEqual(mockProfile);
        done();
      });
    });
  });

  // ── createProfile ──────────────────────────────────────────────────────────

  describe('createProfile()', () => {
    it('dovrebbe inviare una POST con FormData e ritornare il profilo creato', () => {
      const file = new File(['img'], 'avatar.png', { type: 'image/png' });

      service
        .createProfile(mockProfile, mockAddress, 42, file)
        .subscribe((res) => {
          expect(res).toEqual(mockProfile);
        });

      const req = httpMock.expectOne(`${BASE}/create?userId=42`);
      expect(req.request.method).toBe('POST');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockProfile);
    });

    it('dovrebbe funzionare anche senza file (profilePicture falsy)', () => {
      service
        .createProfile(mockProfile, mockAddress, 1, null as any)
        .subscribe((res) => {
          expect(res).toEqual(mockProfile);
        });

      const req = httpMock.expectOne(`${BASE}/create?userId=1`);
      expect(req.request.method).toBe('POST');
      req.flush(mockProfile);
    });
  });

  // ── updateProfile ──────────────────────────────────────────────────────────

  describe('updateProfile()', () => {
    it('dovrebbe inviare una PUT con FormData e ritornare il profilo aggiornato', () => {
      const file = new File(['img'], 'avatar.png', { type: 'image/png' });

      service
        .updateProfile(42, mockProfile, mockAddress, file)
        .subscribe((res) => {
          expect(res).toEqual(mockProfile);
        });

      const req = httpMock.expectOne(`${BASE}/update?userId=42`);
      expect(req.request.method).toBe('PUT');
      expect(req.request.body instanceof FormData).toBeTrue();
      req.flush(mockProfile);
    });
  });

  // ── getProfileById ─────────────────────────────────────────────────────────

  describe('getProfileById()', () => {
    it('dovrebbe inviare una GET e ritornare il profilo', () => {
      service.getProfileById(1).subscribe((res) => {
        expect(res).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  // ── getProfileByUserId ─────────────────────────────────────────────────────

  describe('getProfileByUserId()', () => {
    it('dovrebbe inviare una GET al path corretto', () => {
      service.getProfileByUserId(99).subscribe((res) => {
        expect(res).toEqual(mockProfile);
      });

      const req = httpMock.expectOne(`${BASE}/user/99`);
      expect(req.request.method).toBe('GET');
      req.flush(mockProfile);
    });
  });

  // ── deleteProfile ──────────────────────────────────────────────────────────

  describe('deleteProfile()', () => {
    it('dovrebbe inviare una DELETE con il profileId corretto', () => {
      service.deleteProfile(1).subscribe();

      const req = httpMock.expectOne(`${BASE}/1`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ── deleteAllProfiles ──────────────────────────────────────────────────────

  describe('deleteAllProfiles()', () => {
    it('dovrebbe inviare una DELETE su /all', () => {
      service.deleteAllProfiles().subscribe();

      const req = httpMock.expectOne(`${BASE}/all`);
      expect(req.request.method).toBe('DELETE');
      req.flush(null);
    });
  });

  // ── countProfiles ──────────────────────────────────────────────────────────

  describe('countProfiles()', () => {
    it('dovrebbe ritornare il numero di profili attivi', () => {
      service.countProfiles().subscribe((count) => {
        expect(count).toBe(5);
      });

      const req = httpMock.expectOne(`${BASE}/count`);
      expect(req.request.method).toBe('GET');
      req.flush(5);
    });
  });

  // ── countDeletedProfiles ───────────────────────────────────────────────────

  describe('countDeletedProfiles()', () => {
    it('dovrebbe ritornare il numero di profili eliminati', () => {
      service.countDeletedProfiles().subscribe((count) => {
        expect(count).toBe(2);
      });

      const req = httpMock.expectOne(`${BASE}/count-deleted`);
      expect(req.request.method).toBe('GET');
      req.flush(2);
    });
  });

  // ── getProfilesNotDeleted ──────────────────────────────────────────────────

  describe('getProfilesNotDeleted()', () => {
    it('dovrebbe inviare GET con i parametri di paginazione corretti', () => {
      service.getProfilesNotDeleted(0, 10).subscribe((res) => {
        expect(res).toEqual(mockPageResponse);
      });

      const req = httpMock.expectOne(`${BASE}?page=0&size=10`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });
  });

  // ── getProfilesDeleted ─────────────────────────────────────────────────────

  describe('getProfilesDeleted()', () => {
    it('dovrebbe inviare GET su /deleted con i parametri di paginazione', () => {
      service.getProfilesDeleted(1, 5).subscribe((res) => {
        expect(res.content.length).toBe(1);
      });

      const req = httpMock.expectOne(`${BASE}/deleted?page=1&size=5`);
      expect(req.request.method).toBe('GET');
      req.flush(mockPageResponse);
    });
  });

  // ── getProfilePictureByUserId ──────────────────────────────────────────────

  describe('getProfilePictureByUserId()', () => {
    it('dovrebbe richiedere un Blob come responseType', () => {
      const mockBlob = new Blob(['img'], { type: 'image/png' });

      service.getProfilePictureByUserId(7).subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(`${BASE}/user/7/picture`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('blob');
      req.flush(mockBlob);
    });
  });

  // ── getCurrentUserProfileImageBase64 ──────────────────────────────────────

  describe('getCurrentUserProfileImageBase64()', () => {
    it('dovrebbe richiedere text come responseType e ritornare la stringa base64', () => {
      const base64 = 'data:image/png;base64,abc123';

      service.getCurrentUserProfileImageBase64(7).subscribe((str) => {
        expect(str).toBe(base64);
      });

      const req = httpMock.expectOne(`${BASE}/user/7/picture-base64`);
      expect(req.request.method).toBe('GET');
      expect(req.request.responseType).toBe('text');
      req.flush(base64);
    });
  });

  // ── getImageByUrl ──────────────────────────────────────────────────────────

  describe('getImageByUrl()', () => {
    it("dovrebbe effettuare una GET all'URL specificato e ritornare un Blob", () => {
      const url = 'https://example.com/image.jpg';
      const mockBlob = new Blob(['img'], { type: 'image/jpeg' });

      service.getImageByUrl(url).subscribe((blob) => {
        expect(blob).toEqual(mockBlob);
      });

      const req = httpMock.expectOne(url);
      expect(req.request.method).toBe('GET');
      req.flush(mockBlob);
    });
  });
});
