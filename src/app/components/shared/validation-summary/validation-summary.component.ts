import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-validation-summary',
  templateUrl: './validation-summary.component.html',
  styleUrls: ['./validation-summary.component.css'],
})
export class ValidationSummaryComponent {
  @Input() form: FormGroup | null = null;
  @Input() title = 'Please correct the following';
  @Input() customErrors: string[] = [];

  get errors(): string[] {
    const output = [...this.customErrors.filter(Boolean)];
    if (!this.form || !(this.form.touched || this.form.dirty)) {
      return output;
    }
    Object.keys(this.form.controls).forEach((key) => {
      const control = this.form?.get(key);
      if (control?.invalid && control.touched) {
        output.push(this.humanise(key));
      }
    });
    return Array.from(new Set(output));
  }

  private humanise(value: string): string {
    return value.replace(/([A-Z])/g, ' $1').replace(/^./, (char) => char.toUpperCase()) + ' is invalid or missing.';
  }
}
