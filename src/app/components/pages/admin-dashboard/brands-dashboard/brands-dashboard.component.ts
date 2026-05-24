import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Brand } from 'src/app/models/brand';
import { BrandService } from 'src/app/services/brand.service';
import { ConfirmDialogService } from 'src/app/services/confirm-dialog.service';

@Component({
  selector: 'app-brands-dashboard',
  templateUrl: './brands-dashboard.component.html',
  styleUrls: ['./brands-dashboard.component.css']
})
export class BrandsDashboardComponent implements OnInit {
  brands: Brand[] = [];
  dataLoaded = false;

  constructor(
    private brandService: BrandService,
    private toastrService: ToastrService,
    private confirmDialogService: ConfirmDialogService,
  ) { }

  ngOnInit(): void {
    this.getBrands();
  }

  getBrands(): void {
    this.dataLoaded = false;

    this.brandService.getBrands().subscribe((response) => {
      this.brands = response.data || [];
      this.dataLoaded = true;
    });
  }

  async deleteBrand(brand: Brand): Promise<void> {
    const confirmed = await this.confirmDialogService.confirm({
      title: `Delete ${brand.brandName}?`,
      message: 'Removes this brand from the local demo catalogue.',
      confirmLabel: 'Delete',
      danger: true,
    });
    if (!confirmed) { return; }

    this.brandService.deleteBrand(brand).subscribe((response) => {
      this.toastrService.success(response.message || 'Brand deleted.');
      this.getBrands();
    });
  }
}
