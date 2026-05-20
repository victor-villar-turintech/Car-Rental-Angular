import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CustomerActivity } from 'src/app/models/customer-activity';
import { CustomerActivityService } from 'src/app/services/customer-activity.service';

@Component({ selector: 'app-admin-customer-activity-dashboard', templateUrl: './customer-activity-dashboard.component.html', styleUrls: ['./customer-activity-dashboard.component.css'] })
export class AdminCustomerActivityDashboardComponent implements OnInit {
  activity: CustomerActivity[] = [];
  searchText = '';

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
    if (!term) { return this.activity; }
    return this.activity.filter((item) => `${item.customerEmail} ${item.activityType} ${item.message} ${item.entityReference || ''}`.toLowerCase().includes(term));
  }
}
