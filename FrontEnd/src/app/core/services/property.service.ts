import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Property {
  _id: string;
  title: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  address: {
    city: string;
    country: string;
  };
  amenities: string[];
  isActive: boolean;
  images?: string[];
  location?: {
    type: string;
    coordinates: number[];
  };
  imageUrl?: string;
  rating?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PropertyService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/properties';

  getProperties(city?: string, guests?: number, title?: string): Observable<Property[]> {
    let params = new HttpParams();
    if (city) {
      params = params.set('city', city);
    }
    if (guests) {
      params = params.set('guests', guests.toString());
    }
    if (title) {
      params = params.set('title', title);
    }
    return this.http.get<Property[]>(this.apiUrl, { params });
  }

  getProperty(id: string): Observable<Property> {
    return this.http.get<Property>(`${this.apiUrl}/${id}`);
  }

  createProperty(propertyData: any): Observable<any> {
    return this.http.post(this.apiUrl, propertyData);
  }
}
