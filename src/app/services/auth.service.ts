import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { LoginModel } from '../models/loginModel';
import { PasswordChangeModel } from '../models/passwordChangeModel';
import { RegisterModel } from '../models/register';
import { ResponseModel } from '../models/responseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { TokenModel } from '../models/tokenModel';
import { LocalStorageService } from './local-storage-service.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
  name = 'Demo';
  surname = 'User';
  userName = 'Demo User';
  role: any = ['admin'];
  roles: any[] = ['admin'];
  token: any;
  isLoggedIn = false;
  userId = 1;
  email = 'demo.user@example.com';

  constructor(
    private router: Router,
    private localStorage: LocalStorageService
  ) {}

  login(loginModel: LoginModel): Observable<SingleResponseModel<TokenModel>> {
    this.email = loginModel.email || this.email;
    return of({
      success: true,
      message: 'Logged in with demo account.',
      data: {
        token: 'mock-rentacar-token',
        expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      }
    });
  }

  register(registerModel: RegisterModel): Observable<ResponseModel> {
    return of({ success: true, message: 'Demo registration completed.' });
  }

  logout(): void {
    this.localStorage.clear();
    localStorage.removeItem('token');
    this.isLoggedIn = false;
  }

  isAuthenticated(): boolean {
    return !!this.localStorage.getItem('token') || !!localStorage.getItem('token');
  }

  userDetailFromToken(): void {
    this.name = 'Demo';
    this.surname = 'User';
    this.userName = 'Demo User';
    this.roles = ['admin'];
    this.role = ['admin'];
    this.userId = 1;
    this.email = 'demo.user@example.com';
  }

  roleCheck(roleList: string[]): boolean {
    return roleList.some((role) => this.roles.includes(role));
  }

  async onRefresh(): Promise<boolean> {
    return Promise.resolve(true);
  }

  changePassword(passwordChangeModel: PasswordChangeModel): Observable<ResponseModel> {
    return of({ success: true, message: 'Password changed in demo mode.' });
  }

  getCurrentUserId(): number {
    return this.userId;
  }
}
