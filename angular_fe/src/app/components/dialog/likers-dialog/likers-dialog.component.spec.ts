// ─────────────────────────────────────────────────────────────────────────────
// SECTION: IMPORTS
// ─────────────────────────────────────────────────────────────────────────────

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { LikersDialogComponent } from './likers-dialog.component';
import { AdvertisementLikesService } from 'src/app/services/path/likes/advertisement-likes.service';
import { HttpErrorResponse } from '@angular/common/http';

// ─────────────────────────────────────────────────────────────────────────────
// SECTION: TEST SUITE
// ─────────────────────────────────────────────────────────────────────────────

describe('LikersDialogComponent', () => {
  let component: LikersDialogComponent;
  let fixture: ComponentFixture<LikersDialogComponent>;
  let likeService: jasmine.SpyObj<AdvertisementLikesService>;

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: MOCK DATA
  // ─────────────────────────────────────────────────────────────────────────

  const mockDialogData = {
    advertisementId: 123,
    title: 'Test Product',
  };

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: TEST SETUP
  // ─────────────────────────────────────────────────────────────────────────

  beforeEach(async () => {
  const spy = jasmine.createSpyObj('AdvertisementLikesService', ['getLikesByAdvertisement']);
  spy.getLikesByAdvertisement.and.returnValue(
    of({
      status: 'success',
      message: 'Likes retrieved successfully',
      data: [
        { userId: 1, email: 'user1@test.com', likedAt: '2024-01-15T10:30:00Z' },
        { userId: 2, email: 'user2@test.com', likedAt: '2024-01-16T14:20:00Z' },
      ]
    })
  );

  await TestBed.configureTestingModule({
    imports: [LikersDialogComponent, NoopAnimationsModule],
    providers: [
      { provide: MAT_DIALOG_DATA, useValue: mockDialogData },
      { provide: AdvertisementLikesService, useValue: spy },
    ],
  }).compileComponents();

  fixture = TestBed.createComponent(LikersDialogComponent);
  component = fixture.componentInstance;
  likeService = TestBed.inject(AdvertisementLikesService) as jasmine.SpyObj<AdvertisementLikesService>;

  fixture.detectChanges();
});

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: BASIC TESTS
  // ─────────────────────────────────────────────────────────────────────────

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: INITIALIZATION TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Initialization', () => {
    it('should have dialog data injected', () => {
      expect(component.data.advertisementId).toBe(123);
      expect(component.data.title).toBe('Test Product');
    });

    it('should have isLoading true after component creation', () => {
      const newFixture = TestBed.createComponent(LikersDialogComponent);
      const newComponent = newFixture.componentInstance;
      expect(newComponent.isLoading).toBeTrue();
    });

    it('should fetch likers on init', () => {
      expect(likeService.getLikesByAdvertisement).toHaveBeenCalledWith(123);
      expect(component.likers.length).toBe(2);
      expect(component.likers[0].email).toBe('user1@test.com');
      expect(component.isLoading).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: ERROR HANDLING TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Error handling', () => {
    it('should handle error when fetching likers', () => {
      const errorResponse = new HttpErrorResponse({
        status: 404,
        statusText: 'Not Found',
      });
      likeService.getLikesByAdvertisement.and.returnValue(
        throwError(() => errorResponse),
      );

      const errorFixture = TestBed.createComponent(LikersDialogComponent);
      const errorComponent = errorFixture.componentInstance;
      errorFixture.detectChanges();

      expect(errorComponent.likers).toEqual([]);
      expect(errorComponent.isLoading).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: DATA LOADING TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Data loading', () => {
    it('should populate likers array after successful fetch', () => {
      expect(component.likers.length).toBe(2);
      expect(component.likers[0]).toEqual({
        userId: 1,
        email: 'user1@test.com',
        likedAt: '2024-01-15T10:30:00Z',
      });
    });

    it('should set isLoading to false after data loads', () => {
      expect(component.isLoading).toBeFalse();
    });
  });

  // ─────────────────────────────────────────────────────────────────────────
  // SUBSECTION: EMPTY STATE TESTS
  // ─────────────────────────────────────────────────────────────────────────

  describe('Empty state', () => {
    it('should handle empty likers array', () => {
  likeService.getLikesByAdvertisement.and.returnValue(
    of({
      status: 'success',
      message: 'No likes found',
      data: []
    })
  );

  const emptyFixture = TestBed.createComponent(LikersDialogComponent);
  const emptyComponent = emptyFixture.componentInstance;
  emptyFixture.detectChanges();

  expect(emptyComponent.likers).toEqual([]);
  expect(emptyComponent.isLoading).toBeFalse();
});
  });
});