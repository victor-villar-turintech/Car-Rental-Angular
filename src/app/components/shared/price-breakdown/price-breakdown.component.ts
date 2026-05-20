import { Component, Input } from '@angular/core';
import { BookingExtraSelection } from 'src/app/models/booking-extra';

@Component({
  selector: 'app-price-breakdown',
  templateUrl: './price-breakdown.component.html',
  styleUrls: ['./price-breakdown.component.css'],
})
export class PriceBreakdownComponent {
  @Input() dailyPrice = 0;
  @Input() rentalDays = 0;
  @Input() vehicleSubtotal = 0;
  @Input() extrasSubtotal = 0;
  @Input() total = 0;
  @Input() extras: BookingExtraSelection[] = [];
  @Input() compact = false;
}
