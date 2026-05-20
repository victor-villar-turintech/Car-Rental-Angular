import { Component, OnInit } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Customer } from 'src/app/models/customer';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({ selector: 'app-navi', templateUrl: './navi.component.html', styleUrls: ['./navi.component.css'] })
export class NaviComponent implements OnInit {
  currentCustomer: Customer | undefined;

  constructor(private customerAuthService: CustomerAuthService, private router: Router) {}

  ngOnInit(): void {
    this.refreshCustomer();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => this.refreshCustomer());
  }

  refreshCustomer(): void { this.currentCustomer = this.customerAuthService.getCurrentCustomer(); }

  logout(): void {
    this.customerAuthService.logout();
    this.currentCustomer = undefined;
    this.router.navigate(['/home']);
  }
}
