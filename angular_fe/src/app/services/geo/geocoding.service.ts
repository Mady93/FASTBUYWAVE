import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';
import { CountryResponse } from 'src/app/interfaces/country/country_response';
import { CountryStatesResponse } from 'src/app/interfaces/country/countryStatesResponse';
import { RstCountry } from 'src/app/interfaces/country/rest_country.interface';

/**
 * @category Geocoding
 *
 * @description
 * Provides methods to interact with geolocation and country APIs.
 * Includes functionality to:
 * 1. Get coordinates (latitude & longitude) from a string address.
 * 2. Fetch all countries or country data for display.
 * 3. Retrieve cities or administrative subdivisions (states/regions) for a country.
 *
 * @author Popa Madalina Mariana
 * @version 0.0.0
 */
@Injectable({
  providedIn: 'root',
})
export class GeocodingService {
  /**
   * @description Creates an instance of GeocodingService.
   *
   * @param {HttpClient} http - Angular HttpClient for performing HTTP requests.
   */
  constructor(private http: HttpClient) {}

  /**
   * @description Retrieves latitude and longitude for a given address using OpenStreetMap Nominatim API.
   *
   * @param {string} address - The address to geocode.
   * @returns {Observable<{ lat: string, lon: string } | null>} Observable that emits the coordinates or null if not found.
   *
   * @example
   * geocodingService.getCoordinatesFromAddress('Rome, Italy')
   *   .subscribe(coords => console.log(coords));
   */
  getCoordinatesFromAddress(
    address: string,
  ): Observable<{ lat: string; lon: string } | null> {
    if (!address || !address.trim()) return of(null);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;

    return this.http.get<any[]>(url).pipe(
      map((results) => {
        if (results.length > 0) {
          return {
            lat: results[0].lat,
            lon: results[0].lon,
          };
        }
        return null;
      }),
      catchError(() => of(null)),
    );
  }

  /**
   * @description Retrieves a list of all countries with basic info (name, flags, capital, population, region, cca2 code).
   *
   * @returns {Observable<any[]>} Observable emitting an array of country objects.
   *
   * @example
   * geocodingService.getCountries()
   *   .subscribe(countries => console.log(countries));
   */
  getCountries(): Observable<any[]> {
    return this.http.get<any[]>(
      'https://restcountries.com/v3.1/all?fields=name,flags,capital,population,region,cca2',
    );
  }

  /**
   * @description Retrieves the list of cities for a given country.
   *
   * @param {string} country - The country name to fetch cities for.
   * @returns {Observable<CountryResponse>} Observable emitting the cities of the country.
   */
  getCities(country: string): Observable<CountryResponse> {
    const url = 'https://countriesnow.space/api/v0.1/countries/cities/q';
    const params = new HttpParams().set('country', country);
    return this.http.get<CountryResponse>(url, { params });
  }

  /**
   * @description Retrieves the administrative subdivisions (states or regions) for a given country.
   *
   * @param {string} country - The country name to fetch states for.
   * @returns {Observable<CountryStatesResponse>} Observable emitting the states or regions of the country.
   */
  getStates(country: string): Observable<CountryStatesResponse> {
    const url = `https://countriesnow.space/api/v0.1/countries/states/q`;
    const params = new HttpParams().set('country', country);
    return this.http.get<CountryStatesResponse>(url, { params });
  }

  /**
   * @description Retrieves a lightweight country list suitable for advertisement views.
   * Returns only the country name, ISO code (cca2), and currencies.
   *
   * @returns {Observable<Pick<RstCountry, 'name' | 'cca2' | 'currencies'>[]>} Observable emitting a simplified country list.
   */
  getCountriesAdvertisementView(): Observable<
    Pick<RstCountry, 'name' | 'cca2' | 'currencies'>[]
  > {
    return this.http.get<Pick<RstCountry, 'name' | 'cca2' | 'currencies'>[]>(
      'https://restcountries.com/v3.1/all?fields=name,cca2,currencies',
    );
  }
}
