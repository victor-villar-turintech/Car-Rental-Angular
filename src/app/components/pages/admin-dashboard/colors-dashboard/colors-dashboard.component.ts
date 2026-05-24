import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Color } from 'src/app/models/color';
import { ColorService } from 'src/app/services/color.service';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';

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
    private toastrService: ToastrService,
    private confirmDialogService: ConfirmDialogService,
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

  async deleteColor(color: Color): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: `Delete ${color.colorName}?`,
      message: 'Removes this colour from the local demo catalogue.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) { return; }

    this.colorService.deleteColor(color).subscribe((response) => {
      this.toastrService.success(response.message || 'Colour deleted.');
      this.getColors();
    });
  }
}
