import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseModel } from '../models/responseModel';

export interface AdminSession {
  username: string;
  role: 'Admin';
  loggedInAt: string;
}

@Injectable({ providedIn: 'root' })
export class AdminAuthService {
  readonly demoUsername = 'admin';
  readonly demoPassword = 'admin123';
  private readonly sessionKey = 'rent-a-car-demo-admin-session';

  login(username: string, password: string): Observable<ResponseModel> {
    if ((username || '').trim() !== this.demoUsername || password !== this.demoPassword) {
      return of({ success: false, message: 'Invalid admin username or password.' });
    }

    const session: AdminSession = {
      username: this.demoUsername,
      role: 'Admin',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    return of({ success: true, message: 'Signed in as demo admin.' });
  }

  logout(): void {
    localStorage.removeItem(this.sessionKey);
  }

  isLoggedIn(): boolean {
    return !!this.getSession();
  }

  getSession(): AdminSession | undefined {
    const raw = localStorage.getItem(this.sessionKey);
    if (!raw) {
      return undefined;
    }

    try {
      return JSON.parse(raw) as AdminSession;
    } catch {
      localStorage.removeItem(this.sessionKey);
      return undefined;
    }
  }
}
