import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-navi',
  templateUrl: './navi.component.html',
  styleUrls: ['./navi.component.css']
})
export class NaviComponent implements OnInit {
  firstName = 'Demo';
  lastName = 'User';

  constructor(
    private authService: AuthService,
    private toastrService: ToastrService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.refreshUserDetails();
  }

  isAuthenticated(): boolean {
    return this.authService.isAuthenticated();
  }

  refreshUserDetails(): void {
    if (this.isAuthenticated()) {
      this.authService.userDetailFromToken();
      this.firstName = this.authService.name || 'Demo';
      this.lastName = this.authService.surname || 'User';
    }
  }

  logout(): void {
    this.authService.logout();
    this.toastrService.success('Logged out', 'Successful');
    this.router.navigate(['/home']);
  }
}
