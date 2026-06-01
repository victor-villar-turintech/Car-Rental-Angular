import { Injectable } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { AdminAuthService } from '../services/admin-auth.service';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard  {
  constructor(private adminAuthService: AdminAuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    return this.adminAuthService.isLoggedIn() ? true : this.router.createUrlTree(['/admin/login']);
  }
}
