import { Component, Input } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-error',
  templateUrl: './form-error.component.html',
  styleUrls: ['./form-error.component.css'],
})
export class FormErrorComponent {
  @Input() control: AbstractControl | null = null;
  @Input() label = 'This field';

  get message(): string {
    if (!this.control || !this.control.touched || !this.control.errors) {
      return '';
    }
    if (this.control.errors.required) return `${this.label} is required.`;
    if (this.control.errors.email) return `${this.label} must be a valid email address.`;
    if (this.control.errors.minlength) return `${this.label} must be at least ${this.control.errors.minlength.requiredLength} characters.`;
    if (this.control.errors.pattern) return `${this.label} has an invalid format.`;
    if (this.control.errors.min) return `${this.label} must be at least ${this.control.errors.min.min}.`;
    if (this.control.errors.mismatch) return 'Password confirmation must match.';
    if (this.control.errors.expired) return 'Expiry date must not be in the past.';
    return `${this.label} is invalid.`;
  }
}
