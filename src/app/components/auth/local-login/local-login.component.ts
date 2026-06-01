import { Component } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({ selector: 'app-local-login', templateUrl: './local-login.component.html', styleUrls: ['./local-login.component.css'] })
export class LocalLoginComponent {
  loginForm: UntypedFormGroup;
  returnUrl = '/account';

  constructor(private fb: UntypedFormBuilder, private authService: CustomerAuthService, private router: Router, private route: ActivatedRoute, private toastrService: ToastrService) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/account';
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() { return this.loginForm.controls; }

  login(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      this.toastrService.error('Please correct the highlighted fields.', 'Sign in');
      return;
    }
    const value = this.loginForm.value;
    this.authService.login(value.email, value.password).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Sign in failed');
        return;
      }
      this.toastrService.success(response.message, 'Signed in');
      this.router.navigateByUrl(this.returnUrl);
    });
  }
}
