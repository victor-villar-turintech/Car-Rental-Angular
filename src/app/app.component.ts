import { Component } from '@angular/core';
import { ConfirmDialogService } from './services/confirm-dialog.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'RentACar-FrontEnd';

  readonly confirmState$ = this.confirmDialogService.state;

  constructor(private confirmDialogService: ConfirmDialogService) {}

  onConfirmDialogConfirmed(): void { this.confirmDialogService.resolve(true); }
  onConfirmDialogCancelled(): void { this.confirmDialogService.resolve(false); }



  private readonly adminToolbarStorageKeys: string[] = [
    'adminAuth',
    'adminLoggedIn',
    'adminLogin',
    'adminSession',
    'adminToken',
    'adminUser',
    'adminUsername',
    'admin_username',
    'isAdmin',
    'isAdminLoggedIn',
    'rent-a-car-demo-admin-session'
  ];

  isAdminToolbarVisible(): boolean {
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
      return false;
    }

    const path = window.location.pathname || '';

    if (path === '/admin/login') {
      return false;
    }

    return this.adminToolbarStorageKeys.some((key: string) => {
      const value = localStorage.getItem(key);

      if (value === null || value === undefined || value === '') {
        return false;
      }

      const normalised = String(value).toLowerCase();

      return normalised !== 'false' && normalised !== 'null' && normalised !== 'undefined';
    });
  }

  goToAdminConsole(): void {
    if (typeof window !== 'undefined') {
      window.location.href = '/admin/dashboard';
    }
  }

  logoutAdmin(): void {
    if (typeof localStorage !== 'undefined') {
      this.adminToolbarStorageKeys.forEach((key: string) => localStorage.removeItem(key));

      Object.keys(localStorage)
        .filter((key: string) => key.toLowerCase().includes('admin'))
        .forEach((key: string) => localStorage.removeItem(key));
    }

    if (typeof sessionStorage !== 'undefined') {
      Object.keys(sessionStorage)
        .filter((key: string) => key.toLowerCase().includes('admin'))
        .forEach((key: string) => sessionStorage.removeItem(key));
    }

    if (typeof window !== 'undefined') {
      window.location.href = '/admin/login';
    }
  }

}
