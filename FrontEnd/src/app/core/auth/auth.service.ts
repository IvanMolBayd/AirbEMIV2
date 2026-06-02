import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private readonly API = 'http://localhost:3000/auth';
  private readonly TOKEN_KEY = 'airbemi_token';
  private readonly USER_KEY = 'airbemi_user';

  login(email: string, password: string): Observable<any> {
    return this.http.post<any>(`${this.API}/login`, { email, password });
  }

  register(data: { firstName: string; lastName: string; email: string; password: string }): Observable<any> {
    return this.http.post<any>(`${this.API}/register`, data);
  }

  setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  setUser(user: any): void {
    localStorage.setItem(this.USER_KEY, JSON.stringify(user));
  }

  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  clearToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  getUser(): any {
    const token = this.getToken();
    if (!token) return null;
    try {
      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;
      // atob décode du base64 (remplacer les caractères URL-safe si nécessaire)
      const base64 = payloadBase64.replace(/-/g, '+').replace(/_/g, '/');
      const payloadStr = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const payload = JSON.parse(payloadStr);
      return { 
        id: payload.sub, 
        email: payload.email, 
        firstName: payload.firstName, 
        lastName: payload.lastName,
        role: payload.role 
      };
    } catch { 
      return null; 
    }
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
    this.router.navigate(['/login']);
  }
}
