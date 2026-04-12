import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdvertisementLikesService } from './advertisement-likes.service';
import { ApiConfigService } from '../../api-config/api-config.service';
import { LikeRequestDTO } from 'src/app/interfaces/dtos/like_request_dto';
import { ApiResponseData } from 'src/app/interfaces/dettails/api_response_data';
import { LikeStatusDto } from 'src/app/interfaces/dtos/like_status_dto.interface';
import { LikeUserDTO } from 'src/app/interfaces/dtos/like-user.dto';

class MockApiConfigService {
  apiLikes = 'http://localhost:8080/api/likes';
}

const mockResponse = <T>(data: T): ApiResponseData<T> => ({
  status: 'success',
  message: 'OK',
  data,
});

const mockLikeStatus: LikeStatusDto = {
  advertisementId: 1,
  liked: true,
};

const mockLikeUser: LikeUserDTO = {
  userId: 10,
  email: 'user@test.com',
  likedAt: '2026-03-01T10:00:00Z',
};

describe('AdvertisementLikesService', () => {
  let service: AdvertisementLikesService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    spyOn(console, 'error');
    spyOn(console, 'log');

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        AdvertisementLikesService,
        { provide: ApiConfigService, useValue: new MockApiConfigService() },
      ],
    });

    service = TestBed.inject(AdvertisementLikesService);
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
  // updateLike
  // ============================================

  describe('updateLike', () => {
    it('should PUT to update a like and return like count', () => {
      const likeRequest: LikeRequestDTO = { liked: true };

      service.updateLike(1, 42, likeRequest).subscribe((result) => {
        expect(result.data).toBe(10);
        expect(result.status).toBe('success');
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/create/update/1/42',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(likeRequest);
      req.flush(mockResponse(10));
    });

    it('should PUT to unlike and return updated like count', () => {
      const likeRequest: LikeRequestDTO = { liked: false };

      service.updateLike(1, 42, likeRequest).subscribe((result) => {
        expect(result.data).toBe(9);
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/create/update/1/42',
      );
      expect(req.request.method).toBe('PUT');
      expect(req.request.body).toEqual(likeRequest);
      req.flush(mockResponse(9));
    });

    it('should handle error on updateLike', () => {
      const likeRequest: LikeRequestDTO = { liked: true };

      service.updateLike(1, 42, likeRequest).subscribe({
        error: (err) => expect(err.status).toBe(401),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/create/update/1/42',
      );
      req.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });
    });

    it('should use correct URL with different user and advertisement IDs', () => {
      const likeRequest: LikeRequestDTO = { liked: true };

      service.updateLike(99, 123, likeRequest).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/create/update/99/123',
      );
      expect(req.request.method).toBe('PUT');
      req.flush(mockResponse(5));
    });
  });

  // ============================================
  // getAllLikesByUser
  // ============================================

  describe('getAllLikesByUser', () => {
    it('should GET all likes for a user', () => {
      service.getAllLikesByUser(1).subscribe((result) => {
        expect(result.data.length).toBe(1);
        expect(result.data[0].advertisementId).toBe(1);
        expect(result.data[0].liked).toBeTrue();
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/likes/likes/user' &&
          r.params.get('userId') === '1',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse([mockLikeStatus]));
    });

    it('should return empty array when user has no likes', () => {
      service.getAllLikesByUser(99).subscribe((result) => {
        expect(result.data.length).toBe(0);
      });

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/likes/likes/user' &&
          r.params.get('userId') === '99',
      );
      req.flush(mockResponse([]));
    });

    it('should handle error on getAllLikesByUser', () => {
      service.getAllLikesByUser(1).subscribe({
        error: (err) => expect(err.status).toBe(404),
      });

      const req = httpMock.expectOne(
        (r) => r.url === 'http://localhost:8080/api/likes/likes/user',
      );
      req.flush('Not Found', { status: 404, statusText: 'Not Found' });
    });

    it('should pass userId as string param', () => {
      service.getAllLikesByUser(42).subscribe();

      const req = httpMock.expectOne(
        (r) =>
          r.url === 'http://localhost:8080/api/likes/likes/user' &&
          r.params.get('userId') === '42',
      );
      req.flush(mockResponse([mockLikeStatus]));
    });
  });

  // ============================================
  // getLikesByAdvertisement
  // ============================================

  describe('getLikesByAdvertisement', () => {
    it('should GET all users who liked an advertisement', () => {
      service.getLikesByAdvertisement(1).subscribe((result) => {
        expect(result.data.length).toBe(1);
        expect(result.data[0].userId).toBe(10);
        expect(result.data[0].email).toBe('user@test.com');
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/advertisement/1',
      );
      expect(req.request.method).toBe('GET');
      req.flush(mockResponse([mockLikeUser]));
    });

    it('should return empty array when no users liked the advertisement', () => {
      service.getLikesByAdvertisement(99).subscribe((result) => {
        expect(result.data.length).toBe(0);
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/advertisement/99',
      );
      req.flush(mockResponse([]));
    });

    it('should handle error on getLikesByAdvertisement', () => {
      service.getLikesByAdvertisement(1).subscribe({
        error: (err) => expect(err.status).toBe(500),
      });

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/advertisement/1',
      );
      req.flush('Error', { status: 500, statusText: 'Internal Server Error' });
    });

    it('should use correct URL with different advertisement ID', () => {
      service.getLikesByAdvertisement(55).subscribe();

      const req = httpMock.expectOne(
        'http://localhost:8080/api/likes/advertisement/55',
      );
      req.flush(mockResponse([mockLikeUser]));
    });
  });
});
