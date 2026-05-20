import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { CustomerAuthService } from '../services/customer-auth.service';

@Injectable({ providedIn: 'root' })
export class CustomerAuthGuard implements CanActivate {
  constructor(private authService: CustomerAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.authService.isLoggedIn() ? true : this.router.createUrlTree(['/login'], { queryParams: { returnUrl: '/account' } });
  }
}
