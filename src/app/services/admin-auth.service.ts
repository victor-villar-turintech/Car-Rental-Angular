import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ResponseModel } from '../models/responseModel';
import { ActivityLogService } from './activity-log.service';

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

  constructor(private activityLogService: ActivityLogService) {}

  login(username: string, password: string): Observable<ResponseModel> {
    if ((username || '').trim() !== this.demoUsername || password !== this.demoPassword) {
      this.activityLogService.record('Failed admin login', 'Admin', `Failed admin login attempt for username "${username || 'blank'}".`, { severity: 'Warning' });
      return of({ success: false, message: 'Invalid admin username or password.' });
    }

    const session: AdminSession = {
      username: this.demoUsername,
      role: 'Admin',
      loggedInAt: new Date().toISOString(),
    };
    localStorage.setItem(this.sessionKey, JSON.stringify(session));
    this.activityLogService.record('Admin logged in', 'Admin', 'Demo admin signed in.', { severity: 'Success', actor: this.demoUsername });
    return of({ success: true, message: 'Signed in as demo admin.' });
  }

  logout(): void {
    this.activityLogService.record('Admin logged out', 'Admin', 'Demo admin signed out.', { severity: 'Info', actor: this.demoUsername });
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
