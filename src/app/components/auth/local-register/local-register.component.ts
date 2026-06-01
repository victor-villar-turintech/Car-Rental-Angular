import { Component } from '@angular/core';
import { AbstractControl, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({ selector: 'app-local-register', templateUrl: './local-register.component.html', styleUrls: ['./local-register.component.css'] })
export class LocalRegisterComponent {
  registerForm: UntypedFormGroup;
  returnUrl = '/account';

  constructor(private fb: UntypedFormBuilder, private authService: CustomerAuthService, private router: Router, private route: ActivatedRoute, private toastrService: ToastrService) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') || '/account';
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.pattern(/^[0-9 +()-]{7,20}$/)]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
    }, { validators: this.passwordsMatch });
  }

  get f() { return this.registerForm.controls; }

  register(): void {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.toastrService.error('Please correct the highlighted fields.', 'Create account');
      return;
    }
    const value = this.registerForm.value;
    this.authService.register({ firstName: value.firstName, lastName: value.lastName, email: value.email, phone: value.phone, password: value.password }).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Registration failed');
        return;
      }
      this.toastrService.success(response.message, 'Account created');
      this.router.navigateByUrl(this.returnUrl);
    });
  }

  private passwordsMatch(group: AbstractControl): { [key: string]: boolean } | null {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    if (!password || !confirmPassword || password === confirmPassword) {
      return null;
    }
    group.get('confirmPassword')?.setErrors({ mismatch: true });
    return { mismatch: true };
  }
}
