import { Component, ElementRef, ViewChild } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { DemoResetService, DemoStorageKey } from 'src/app/services/demo-reset.service';

@Component({
  selector: 'app-admin-settings-dashboard',
  templateUrl: './settings-dashboard.component.html',
  styleUrls: ['./settings-dashboard.component.css'],
})
export class AdminSettingsDashboardComponent {
  readonly targets: DemoStorageKey[] = this.demoResetService.resetTargets;
  @ViewChild('snapshotFileInput') snapshotFileInput?: ElementRef<HTMLInputElement>;
  lastExportedFilename = '';
  lastImportedAt = '';

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

  exportSnapshot(): void {
    const { payload, filename } = this.demoResetService.exportSnapshot();
    const blob = new Blob([payload], { type: 'application/json;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    this.lastExportedFilename = filename;
    this.toastrService.success(`Snapshot exported as ${filename}.`);
  }

  triggerImport(): void {
    this.snapshotFileInput?.nativeElement.click();
  }

  importSnapshot(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) { return; }
    if (!window.confirm(`Import ${file.name}? This overwrites local demo data in this browser. Existing data will be lost.`)) {
      input.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const payload = String(reader.result || '');
      this.demoResetService.importSnapshot(payload).subscribe((response) => {
        if (response.success) {
          this.lastImportedAt = new Date().toISOString();
          this.toastrService.success(response.message);
        } else {
          this.toastrService.error(response.message);
        }
        input.value = '';
      });
    };
    reader.onerror = () => {
      this.toastrService.error('Unable to read snapshot file.');
      input.value = '';
    };
    reader.readAsText(file);
  }
}
