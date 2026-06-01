import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AdminAuthService } from 'src/app/services/admin-auth.service';

@Component({ selector: 'app-admin-login', templateUrl: './admin-login.component.html', styleUrls: ['./admin-login.component.css'] })
export class AdminLoginComponent {
  adminLoginForm: UntypedFormGroup;

  constructor(public adminAuthService: AdminAuthService, private fb: UntypedFormBuilder, private router: Router, private toastrService: ToastrService) {
    this.adminLoginForm = this.fb.group({
      username: [this.adminAuthService.demoUsername, [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  get f() { return this.adminLoginForm.controls; }

  login(): void {
    if (this.adminLoginForm.invalid) {
      this.adminLoginForm.markAllAsTouched();
      return;
    }
    const value = this.adminLoginForm.value;
    this.adminAuthService.login(value.username, value.password).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Admin login failed');
        return;
      }
      this.toastrService.success(response.message, 'Admin');
      this.router.navigate(['/admin/dashboard']);
    });
  }
}
