import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Brand } from 'src/app/models/brand';
import { Color } from 'src/app/models/color';
import { BrandService } from 'src/app/services/brand.service';
import { ColorService } from 'src/app/services/color.service';

@Component({
  selector: 'app-car-filter',
  templateUrl: './car-filter.component.html',
  styleUrls: ['./car-filter.component.css']
})
export class CarFilterComponent implements OnInit {
  brands: Brand[] = [];
  colors: Color[] = [];
  brandIdFilter: number | undefined;
  colorIdFilter: number | undefined;

  constructor(
    private brandService: BrandService,
    private colorService: ColorService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.getBrands();
    this.getColors();
    this.activatedRoute.params.subscribe((params) => {
      this.brandIdFilter = params.brandId ? Number(params.brandId) : undefined;
      this.colorIdFilter = params.colorId ? Number(params.colorId) : undefined;
    });
  }

  applyFilters(): void {
    if (this.brandIdFilter && this.colorIdFilter) {
      this.router.navigate(['/cars/brand', this.brandIdFilter, 'color', this.colorIdFilter]);
    } else if (this.brandIdFilter) {
      this.router.navigate(['/cars/brand', this.brandIdFilter]);
    } else if (this.colorIdFilter) {
      this.router.navigate(['/cars/color', this.colorIdFilter]);
    } else {
      this.router.navigate(['/cars']);
    }
  }

  clearFilters(): void {
    this.brandIdFilter = undefined;
    this.colorIdFilter = undefined;
    this.router.navigate(['/cars']);
  }

  private getBrands(): void {
    this.brandService.getBrands().subscribe((response) => {
      this.brands = response.data;
    });
  }

  private getColors(): void {
    this.colorService.getColors().subscribe((response) => {
      this.colors = response.data;
    });
  }
}
