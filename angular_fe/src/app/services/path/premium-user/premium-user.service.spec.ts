import { TestBed } from '@angular/core/testing';
import { PremiumUserService } from './premium-user.service';
import { AuthGoogleService } from '../../auth_google/auth-google.service';

describe('PremiumUserService', () => {
  let service: PremiumUserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PremiumUserService,
        {
          provide: AuthGoogleService,
          useValue: {},
        },
      ],
    });

    spyOn(PremiumUserService.prototype as any, 'checkPremiumStatus').and.stub();

    service = TestBed.inject(PremiumUserService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isPremiumUser$ should emit false by default', (done) => {
    service.isPremiumUser$.subscribe((val) => {
      expect(val).toBeFalse();
      done();
    });
  });

  it('togglePremiumFeatures() should throw because not implemented', () => {
    expect(() => service.togglePremiumFeatures()).toThrowError('Method not implemented.');
  });
});