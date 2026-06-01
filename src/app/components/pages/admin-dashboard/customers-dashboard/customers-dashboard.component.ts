import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Customer } from 'src/app/models/customer';
import { Rental } from 'src/app/models/rental';
import { RewardAccount } from 'src/app/models/reward';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { RentalService } from 'src/app/services/rental.service';
import { RewardService } from 'src/app/services/reward.service';

interface CustomerEditForm {
  firstName: string;
  lastName: string;
  phone: string;
}

@Component({ selector: 'app-admin-customers-dashboard', templateUrl: './customers-dashboard.component.html', styleUrls: ['./customers-dashboard.component.css'] })
export class AdminCustomersDashboardComponent implements OnInit {
  customers: Customer[] = [];
  bookings: Rental[] = [];
  rewards: RewardAccount[] = [];
  searchText = '';
  expandedCustomerId: number | undefined;
  editingCustomerId: number | undefined;
  editForm: CustomerEditForm = { firstName: '', lastName: '', phone: '' };

  constructor(private customerAuthService: CustomerAuthService, private rentalService: RentalService, private rewardService: RewardService, private toastrService: ToastrService) {}

  ngOnInit(): void { this.load(); }

  load(): void {
    this.customerAuthService.getCustomers().subscribe((response: any) => this.customers = response.data || []);
    this.rentalService.getRental().subscribe((response) => this.bookings = response.data);
    this.rewardService.getAccounts().subscribe((response: any) => this.rewards = response.data || []);
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

  bookingsFor(customer: Customer): Rental[] {
    return this.bookings
      .filter((booking) => this.same(booking.customerEmail, customer.email))
      .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
  }

  toggleExpand(customer: Customer): void {
    if (this.expandedCustomerId === customer.customerId) {
      this.expandedCustomerId = undefined;
      this.editingCustomerId = undefined;
    } else {
      this.expandedCustomerId = customer.customerId;
      this.editingCustomerId = undefined;
    }
  }

  isExpanded(customer: Customer): boolean { return this.expandedCustomerId === customer.customerId; }

  startEdit(customer: Customer): void {
    this.editingCustomerId = customer.customerId;
    this.editForm = {
      firstName: customer.firstName || '',
      lastName: customer.lastName || '',
      phone: customer.phone || '',
    };
  }

  cancelEdit(): void {
    this.editingCustomerId = undefined;
  }

  isEditing(customer: Customer): boolean { return this.editingCustomerId === customer.customerId; }

  saveEdit(customer: Customer): void {
    if (!this.editForm.firstName.trim() || !this.editForm.lastName.trim()) {
      this.toastrService.error('First name and last name are required.');
      return;
    }
    this.customerAuthService.updateCustomerProfile(customer.email, {
      firstName: this.editForm.firstName,
      lastName: this.editForm.lastName,
      phone: this.editForm.phone,
    }).subscribe((response) => {
      if (response.success) {
        this.toastrService.success(response.message || 'Customer updated.');
        this.editingCustomerId = undefined;
        this.load();
      } else {
        this.toastrService.error(response.message || 'Unable to update customer.');
      }
    });
  }

  sendReset(customer: Customer): void {
    this.customerAuthService.generateResetLink(customer.email).subscribe((response: any) => {
      if (response.success) {
        this.toastrService.success(response.message || 'Reset link generated.');
        if (response.resetLink && navigator.clipboard) { navigator.clipboard.writeText(response.resetLink); }
        this.load();
      } else {
        this.toastrService.error(response.message || 'Unable to generate reset link.');
      }
    });
  }

  toggleCustomer(customer: Customer): void {
    const result: any = this.customerAuthService.setCustomerDisabled(customer.email, !customer.isDisabled);
    if (result && typeof result.subscribe === 'function') {
      result.subscribe((response: any) => { this.toastrService.success(response.message || 'Customer updated.'); this.load(); });
    } else {
      this.toastrService.success('Customer updated.');
      this.load();
    }
  }

  private same(left?: string, right?: string): boolean { return (left || '').trim().toLowerCase() === (right || '').trim().toLowerCase(); }
}
