import { Component } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DemoResetService, DemoStorageKey } from 'src/app/services/demo-reset.service';

@Component({
  selector: 'app-admin-settings-dashboard',
  templateUrl: './settings-dashboard.component.html',
  styleUrls: ['./settings-dashboard.component.css'],
})
export class AdminSettingsDashboardComponent {
  readonly targets: DemoStorageKey[] = this.demoResetService.resetTargets;

  constructor(private demoResetService: DemoResetService, private toastrService: ToastrService) {}

  resetTarget(target: DemoStorageKey): void {
    if (!window.confirm(`Reset ${target.label}? This only affects local demo data in this browser.`)) {
      return;
    }
    this.demoResetService.resetKey(target.key, target.label).subscribe((response) => this.toastrService.success(response.message));
  }

  resetBookingsAndPayments(): void {
    if (!window.confirm('Clear bookings and payments from this browser?')) {
      return;
    }
    this.demoResetService.resetBookingsAndPayments().subscribe((response) => this.toastrService.success(response.message));
  }

  restoreDemoExtras(): void {
    this.demoResetService.restoreDemoExtras().subscribe((response) => this.toastrService.success(response.message));
  }

  resetEverything(): void {
    if (!window.confirm('Reset all configured demo data in this browser?')) {
      return;
    }
    this.demoResetService.resetAll().subscribe((response) => this.toastrService.warning(response.message));
  }
}
