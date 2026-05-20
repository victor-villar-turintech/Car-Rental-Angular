import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminAuthService } from 'src/app/services/admin-auth.service';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css'],
})
export class AdminLoginComponent {
  username = 'admin';
  password = '';

  constructor(public adminAuthService: AdminAuthService, private router: Router, private toastrService: ToastrService) {}

  login(): void {
    this.adminAuthService.login(this.username, this.password).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Admin login failed');
        return;
      }

      this.toastrService.success(response.message, 'Admin');
      this.router.navigate(['/admin/dashboard']);
    });
  }
}
