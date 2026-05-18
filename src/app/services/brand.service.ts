import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { ListResponseModel } from '../models/listResponseModel';
import { Brand } from '../models/brand';
import { ResponseModel } from '../models/responseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { MOCK_BRANDS } from '../data/mock-rental-data';

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  private brands: Brand[] = [...MOCK_BRANDS];

  getBrands(): Observable<ListResponseModel<Brand>> {
    return of({ success: true, message: 'Brands loaded.', data: this.brands });
  }

  getById(id: number): Observable<SingleResponseModel<Brand>> {
    const brand = this.brands.find((item) => item.brandId === Number(id));
    return of({ success: !!brand, message: brand ? 'Brand found.' : 'Brand not found.', data: brand });
  }

  addBrand(brand: Brand): Observable<ResponseModel> {
    const nextId = Math.max(...this.brands.map((item) => item.brandId), 0) + 1;
    this.brands = [...this.brands, { ...brand, brandId: brand.brandId || nextId }];
    return of({ success: true, message: 'Brand added.' });
  }

  updateBrand(brand: Brand): Observable<ResponseModel> {
    this.brands = this.brands.map((item) => item.brandId === brand.brandId ? brand : item);
    return of({ success: true, message: 'Brand updated.' });
  }

  deleteBrand(brand: Brand): Observable<ResponseModel> {
    this.brands = this.brands.filter((item) => item.brandId !== brand.brandId);
    return of({ success: true, message: 'Brand deleted.' });
  }
}
