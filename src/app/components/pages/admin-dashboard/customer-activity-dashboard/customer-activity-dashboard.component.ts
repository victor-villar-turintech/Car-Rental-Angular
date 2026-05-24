import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerActivity, CustomerActivityType } from 'src/app/models/customer-activity';
import { CustomerActivityService } from 'src/app/services/customer-activity.service';

@Component({ selector: 'app-admin-customer-activity-dashboard', templateUrl: './customer-activity-dashboard.component.html', styleUrls: ['./customer-activity-dashboard.component.css'] })
export class AdminCustomerActivityDashboardComponent implements OnInit {
  activity: CustomerActivity[] = [];
  searchText = '';
  typeFilter: CustomerActivityType | '' = '';
  fromDate = '';
  toDate = '';

  readonly activityTypes: CustomerActivityType[] = [
    'Registered', 'LoggedIn', 'LoggedOut',
    'ProfileUpdated', 'BookingCreated', 'BookingCancelled',
    'PaymentCompleted', 'RefundIssued',
    'PasswordResetRequested', 'DiscountApplied',
    'RewardsEarned', 'RewardsAdjusted', 'RewardsRedeemed',
  ];

  constructor(private route: ActivatedRoute, private activityService: CustomerActivityService) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.searchText = params.email || '';
      this.load();
    });
  }

  load(): void { this.activityService.getActivity().subscribe((response) => this.activity = response.data); }

  get filteredActivity(): CustomerActivity[] {
    const term = this.searchText.trim().toLowerCase();
    const fromTime = this.fromDate ? new Date(this.fromDate).getTime() : undefined;
    const toTime = this.toDate ? new Date(this.toDate + 'T23:59:59').getTime() : undefined;
    return [...this.activity]
      .filter((item) => !this.typeFilter || item.activityType === this.typeFilter)
      .filter((item) => {
        if (fromTime === undefined && toTime === undefined) { return true; }
        const created = new Date(item.createdAt).getTime();
        if (fromTime !== undefined && created < fromTime) { return false; }
        if (toTime !== undefined && created > toTime) { return false; }
        return true;
      })
      .filter((item) => {
        if (!term) { return true; }
        return `${item.customerEmail} ${item.activityType} ${item.message} ${item.entityReference || ''}`.toLowerCase().includes(term);
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  clearFilters(): void {
    this.searchText = '';
    this.typeFilter = '';
    this.fromDate = '';
    this.toDate = '';
  }
}
