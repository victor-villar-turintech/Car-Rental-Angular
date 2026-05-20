import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/models/customer';
import { Rental } from 'src/app/models/rental';
import { RewardAccount } from 'src/app/models/reward';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { RentalService } from 'src/app/services/rental.service';
import { RewardService } from 'src/app/services/reward.service';

@Component({ selector: 'app-admin-customers-dashboard', templateUrl: './customers-dashboard.component.html', styleUrls: ['./customers-dashboard.component.css'] })
export class AdminCustomersDashboardComponent implements OnInit {
  customers: Customer[] = [];
  bookings: Rental[] = [];
  rewards: RewardAccount[] = [];
  searchText = '';

  constructor(private customerAuthService: CustomerAuthService, private rentalService: RentalService, private rewardService: RewardService, private toastrService: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.customerAuthService.getCustomers().subscribe((response) => this.customers = response.data);
    this.rentalService.getRental().subscribe((response) => this.bookings = response.data);
    this.rewardService.getAccounts().subscribe((response) => this.rewards = response.data);
  }

  get filteredCustomers(): Customer[] {
    const term = this.searchText.trim().toLowerCase();
    if (!term) { return this.customers; }
    return this.customers.filter((customer) => `${customer.firstName} ${customer.lastName} ${customer.email} ${customer.phone || ''}`.toLowerCase().includes(term));
  }

  bookingCount(customer: Customer): number { return this.bookings.filter((booking) => this.same(booking.customerEmail, customer.email)).length; }
  totalSpend(customer: Customer): number { return this.bookings.filter((booking) => this.same(booking.customerEmail, customer.email) && booking.paymentStatus === 'Paid').reduce((sum, booking) => sum + Number(booking.totalRentPrice || 0), 0); }
  rewardBalance(customer: Customer): number { return this.rewards.find((reward) => this.same(reward.customerEmail, customer.email))?.pointsBalance || 0; }
  lastBooking(customer: Customer): string { const bookings = this.bookings.filter((booking) => this.same(booking.customerEmail, customer.email)); return bookings[0]?.createdAt || ''; }

  sendReset(customer: Customer): void {
    this.customerAuthService.generateResetLink(customer.email).subscribe((response) => {
      const updated = response.data[0];
      const url = `${window.location.origin}/reset-password?token=${updated?.resetToken}`;
      navigator.clipboard?.writeText(url);
      this.toastrService.success('Mock reset link copied to clipboard.', 'Reset link');
      this.load();
    });
  }

  toggleCustomer(customer: Customer): void {
    this.customerAuthService.setCustomerDisabled(customer.email, !customer.isDisabled).subscribe((response) => { this.toastrService.success(response.message); this.load(); });
  }

  private same(left?: string, right?: string): boolean { return (left || '').trim().toLowerCase() === (right || '').trim().toLowerCase(); }
}
