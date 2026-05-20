import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({
  selector: 'app-local-login',
  templateUrl: './local-login.component.html',
  styleUrls: ['./local-login.component.css'],
})
export class LocalLoginComponent {
  email = '';
  password = '';
  returnUrl = '/account';

  constructor(
    private authService: CustomerAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastrService: ToastrService
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/account';
  }

  login(): void {
    if (!this.email || !this.password) {
      this.toastrService.error('Email and password are required.', 'Missing details');
      return;
    }

    this.authService.login(this.email, this.password).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Sign in failed');
        return;
      }

      this.toastrService.success(response.message, 'Signed in');
      this.router.navigateByUrl(this.returnUrl);
    });
  }
}
