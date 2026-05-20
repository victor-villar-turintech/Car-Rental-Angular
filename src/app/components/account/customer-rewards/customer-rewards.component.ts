import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { RewardAccount, RewardTransaction } from 'src/app/models/reward';
import { CustomerAuthService } from 'src/app/services/customer-auth.service';
import { RewardService } from 'src/app/services/reward.service';

@Component({ selector: 'app-customer-rewards', templateUrl: './customer-rewards.component.html', styleUrls: ['./customer-rewards.component.css'] })
export class CustomerRewardsComponent implements OnInit {
  account: RewardAccount | undefined;
  transactions: RewardTransaction[] = [];

  constructor(private authService: CustomerAuthService, private rewardService: RewardService, private router: Router) {}

  ngOnInit(): void {
    const customer = this.authService.getCurrentCustomer();
    if (!customer) { this.router.navigate(['/login']); return; }
    this.account = this.rewardService.getAccount(customer.email);
    this.rewardService.getTransactions(customer.email).subscribe((response) => this.transactions = response.data);
  }
}
