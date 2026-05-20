import { Component, OnInit } from '@angular/core';
import { Rental, RentalMetrics } from 'src/app/models/rental';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-admin-metrics-dashboard',
  templateUrl: './metrics-dashboard.component.html',
  styleUrls: ['./metrics-dashboard.component.css'],
})
export class AdminMetricsDashboardComponent implements OnInit {
  metrics: RentalMetrics;
  recentBookings: Rental[] = [];

  constructor(private rentalService: RentalService) {}

  ngOnInit(): void {
    this.loadMetrics();
  }

  loadMetrics(): void {
    this.rentalService.getMetrics().subscribe((metrics) => {
      this.metrics = metrics;
    });

    this.rentalService.getRental().subscribe((response) => {
      this.recentBookings = [...response.data]
        .sort((a, b) => {
          const left = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const right = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return right - left;
        })
        .slice(0, 5);
    });
  }
}
