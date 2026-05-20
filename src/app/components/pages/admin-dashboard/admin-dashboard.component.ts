import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AdminAuthService } from 'src/app/services/admin-auth.service';

@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent {
  constructor(private adminAuthService: AdminAuthService, private router: Router) {}

  logout(): void {
    this.adminAuthService.logout();
    this.router.navigate(['/admin/login']);
  }
}
