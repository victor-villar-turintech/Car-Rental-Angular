import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-status-badge',
  templateUrl: './status-badge.component.html',
  styleUrls: ['./status-badge.component.css'],
})
export class StatusBadgeComponent {
  @Input() status = 'Pending';

  get statusClass(): string {
    return String(this.status || 'Pending').toLowerCase().replace(/\s+/g, '-');
  }
}
