import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CustomerActivity } from 'src/app/models/customer-activity';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { CustomerActivityService } from 'src/app/services/customer-activity.service';

@Component({ selector: 'app-customer-activity', templateUrl: './customer-activity.component.html', styleUrls: ['./customer-activity.component.css'] })
export class CustomerActivityComponent implements OnInit {
  activity: CustomerActivity[] = [];

  constructor(private authService: CustomerAuthService, private activityService: CustomerActivityService, private router: Router) {}

  ngOnInit(): void {
    const customer = this.authService.getCurrentCustomer();
    if (!customer) { this.router.navigate(['/login']); return; }
    this.activityService.getActivityForCustomer(customer.email).subscribe((response) => this.activity = response.data);
  }
}
