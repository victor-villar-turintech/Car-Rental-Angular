import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/models/customer';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';

@Component({
  selector: 'app-customer-account',
  templateUrl: './customer-account.component.html',
  styleUrls: ['./customer-account.component.css'],
})
export class CustomerAccountComponent implements OnInit {
  customer: Customer;
  firstName = '';
  lastName = '';
  phone = '';

  constructor(private authService: CustomerAuthService, private router: Router, private toastrService: ToastrService) {}

  ngOnInit(): void {
    this.loadCustomer();
  }

  loadCustomer(): void {
    this.customer = this.authService.getCurrentCustomer();
    if (!this.customer) {
      this.router.navigate(['/login']);
      return;
    }

    this.firstName = this.customer.firstName;
    this.lastName = this.customer.lastName;
    this.phone = this.customer.phone || '';
  }

  save(): void {
    this.authService.updateCurrentCustomer({ firstName: this.firstName, lastName: this.lastName, phone: this.phone }).subscribe((response) => {
      if (!response.success) {
        this.toastrService.error(response.message, 'Update failed');
        return;
      }

      this.toastrService.success(response.message, 'Updated');
      this.loadCustomer();
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/home']);
  }
}
