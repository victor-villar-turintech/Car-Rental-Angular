import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Color } from 'src/app/models/color';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-colors-dashboard',
  templateUrl: './colors-dashboard.component.html',
  styleUrls: ['./colors-dashboard.component.css']
})
export class ColorsDashboardComponent implements OnInit {
  colors: Color[] = [];
  dataLoaded = false;

  constructor(
    private colorService: ColorService,
    private toastrService: ToastrService
  ) { }

  ngOnInit(): void {
    this.getColors();
  }

  getColors(): void {
    this.dataLoaded = false;

    this.colorService.getColors().subscribe((response) => {
      this.colors = response.data || [];
      this.dataLoaded = true;
    });
  }

  deleteColor(color: Color): void {
    if (!window.confirm(`Delete ${color.colorName}?`)) {
      return;
    }

    this.colorService.deleteColor(color).subscribe((response) => {
      this.toastrService.success(response.message || 'Colour deleted.');
      this.getColors();
    });
  }
}
