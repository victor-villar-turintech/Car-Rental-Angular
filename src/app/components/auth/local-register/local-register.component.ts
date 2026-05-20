import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({
  selector: 'app-local-register',
  templateUrl: './local-register.component.html',
  styleUrls: ['./local-register.component.css'],
})
export class LocalRegisterComponent {
  firstName = '';
  lastName = '';
  email = '';
  phone = '';
  password = '';
  confirmPassword = '';

  constructor(private authService: CustomerAuthService, private router: Router, private toastrService: ToastrService) {}

  register(): void {
    if (!this.firstName || !this.lastName || !this.email || !this.password) {
      this.toastrService.error('First name, last name, email and password are required.', 'Missing details');
      return;
    }

    if (this.password.length < 6) {
      this.toastrService.error('Use at least 6 characters for this demo password.', 'Password too short');
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.toastrService.error('Password confirmation does not match.', 'Check password');
      return;
    }

    this.authService.register({
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      phone: this.phone,
      password: this.password,
    }).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Registration failed');
        return;
      }

      this.toastrService.success(response.message, 'Account created');
      this.router.navigate(['/account']);
    });
  }
}
