import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Color } from '../models/color';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { SingleResponseModel } from '../models/singleResponseModel';
import { MOCK_COLORS } from '../data/mock-rental-data';

@Injectable({
  providedIn: 'root'
})
export class ColorService {
  private colors: Color[] = [...MOCK_COLORS];

  getColors(): Observable<ListResponseModel<Color>> {
    return of({ success: true, message: 'Colours loaded.', data: this.colors });
  }

  getById(id: number): Observable<SingleResponseModel<Color>> {
    const color = this.colors.find((item) => item.colorId === Number(id));
    return of({ success: !!color, message: color ? 'Colour found.' : 'Colour not found.', data: color });
  }

  addColor(color: Color): Observable<ResponseModel> {
    const nextId = Math.max(...this.colors.map((item) => item.colorId), 0) + 1;
    this.colors = [...this.colors, { ...color, colorId: color.colorId || nextId }];
    return of({ success: true, message: 'Colour added.' });
  }

  updateColor(color: Color): Observable<ResponseModel> {
    this.colors = this.colors.map((item) => item.colorId === color.colorId ? color : item);
    return of({ success: true, message: 'Colour updated.' });
  }

  deleteColor(color: Color): Observable<ResponseModel> {
    this.colors = this.colors.filter((item) => item.colorId !== color.colorId);
    return of({ success: true, message: 'Colour deleted.' });
  }
}
