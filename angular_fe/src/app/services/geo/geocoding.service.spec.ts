import { TestBed } from '@angular/core/testing';
import { provideHttpClient, withFetch } from '@angular/common/http';
import {
  provideHttpClientTesting,
  HttpTestingController,
} from '@angular/common/http/testing';
import { GeocodingService } from './geocoding.service';

describe('GeocodingService', () => {
  let service: GeocodingService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withFetch()),
        provideHttpClientTesting(),
        GeocodingService,
      ],
    });

    service = TestBed.inject(GeocodingService);
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
  // getCoordinatesFromAddress
  // ============================================

  it('should return null for empty address', (done) => {
    service.getCoordinatesFromAddress('').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
    httpMock.expectNone((r) => r.url.includes('nominatim.openstreetmap.org'));
  });

  it('should return null for whitespace-only address', (done) => {
    service.getCoordinatesFromAddress('   ').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });
    httpMock.expectNone((r) => r.url.includes('nominatim.openstreetmap.org'));
  });

  it('should return coordinates when address is found', (done) => {
    const mockResponse = [{ lat: '41.9027835', lon: '12.4963655' }];

    service.getCoordinatesFromAddress('Rome, Italy').subscribe((result) => {
      expect(result).toEqual({ lat: '41.9027835', lon: '12.4963655' });
      done();
    });

    const req = httpMock.expectOne((r) =>
      r.url.includes('nominatim.openstreetmap.org'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('should return null when address is not found', (done) => {
    service
      .getCoordinatesFromAddress('Unknown Place XYZ')
      .subscribe((result) => {
        expect(result).toBeNull();
        done();
      });

    const req = httpMock.expectOne((r) =>
      r.url.includes('nominatim.openstreetmap.org'),
    );
    req.flush([]);
  });

  it('should return null on HTTP error', (done) => {
    service.getCoordinatesFromAddress('Rome').subscribe((result) => {
      expect(result).toBeNull();
      done();
    });

    const req = httpMock.expectOne((r) =>
      r.url.includes('nominatim.openstreetmap.org'),
    );
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  // ============================================
  // getCountries
  // ============================================

  it('should fetch all countries', (done) => {
    const mockCountries = [
      { name: { common: 'Italy' }, cca2: 'IT', region: 'Europe' },
      { name: { common: 'France' }, cca2: 'FR', region: 'Europe' },
    ];

    service.getCountries().subscribe((countries) => {
      expect(countries.length).toBe(2);
      expect(countries[0].cca2).toBe('IT');
      done();
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('restcountries.com') && r.url.includes('name,flags'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockCountries);
  });

  // ============================================
  // getCities
  // ============================================

  it('should fetch cities for a country', (done) => {
    const mockResponse = {
      error: false,
      msg: 'cities in Italy',
      data: ['Rome', 'Milan'],
    };

    service.getCities('Italy').subscribe((result) => {
      expect(result.data).toEqual(['Rome', 'Milan']);
      done();
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('countries/cities') &&
        r.params.get('country') === 'Italy',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ============================================
  // getStates
  // ============================================

  it('should fetch states for a country', (done) => {
    const mockResponse = {
      error: false,
      msg: 'states in Italy',
      data: {
        name: 'Italy',
        iso3: 'ITA',
        states: [{ name: 'Lazio' }, { name: 'Lombardy' }],
      },
    };

    service.getStates('Italy').subscribe((result) => {
      expect(result.data.states.length).toBe(2);
      done();
    });

    const req = httpMock.expectOne(
      (r) =>
        r.url.includes('countries/states') &&
        r.params.get('country') === 'Italy',
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  // ============================================
  // getCountriesAdvertisementView
  // ============================================

  it('should fetch countries for advertisement view', (done) => {
    const mockResponse = [
      {
        name: { common: 'Italy' },
        cca2: 'IT',
        currencies: { EUR: { name: 'Euro' } },
      },
    ];

    service.getCountriesAdvertisementView().subscribe((result) => {
      expect(result.length).toBe(1);
      expect(result[0].cca2).toBe('IT');
      done();
    });

    const req = httpMock.expectOne(
      (r) => r.url.includes('restcountries.com') && r.url.includes('name,cca2'),
    );
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });
});
