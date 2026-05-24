import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface BackendUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: 'customer' | 'admin';
  rewardPoints: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: BackendUser;
}

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
}

/**
 * Thin HTTP client for the NestJS backend (Phases 7-8 of the handover plan).
 * Only used when `environment.useBackend === true`. The default demo build
 * leaves localStorage-backed services in place.
 */
@Injectable({ providedIn: 'root' })
export class BackendAuthService {
  private readonly tokenKey = 'rentacar.backend.token';
  private readonly userKey = 'rentacar.backend.user';

  constructor(private readonly http: HttpClient) {}

  get enabled(): boolean {
    return environment.useBackend;
  }

  get apiBase(): string {
    return environment.backendUrl;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/login`, { email, password });
  }

  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiBase}/auth/register`, payload);
  }

  me(): Observable<BackendUser> {
    return this.http.get<BackendUser>(`${this.apiBase}/auth/me`);
  }

  persistSession(auth: AuthResponse): void {
    try {
      localStorage.setItem(this.tokenKey, auth.token);
      localStorage.setItem(this.userKey, JSON.stringify(auth.user));
    } catch {
      // localStorage unavailable - non-fatal
    }
  }

  clearSession(): void {
    try {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    } catch {
      // ignore
    }
  }

  readToken(): string | null {
    try {
      return localStorage.getItem(this.tokenKey);
    } catch {
      return null;
    }
  }

  readUser(): BackendUser | null {
    try {
      const raw = localStorage.getItem(this.userKey);
      return raw ? (JSON.parse(raw) as BackendUser) : null;
    } catch {
      return null;
    }
  }
}
