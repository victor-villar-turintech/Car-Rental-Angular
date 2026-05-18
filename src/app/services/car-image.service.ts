import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CarImage } from '../models/carImage';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';
import { MOCK_CAR_IMAGES } from '../data/mock-rental-data';

@Injectable({
  providedIn: 'root'
})
export class CarImageService {
  private carImages: CarImage[] = [...MOCK_CAR_IMAGES];

  getCarImages(carId: number): Observable<ListResponseModel<CarImage>> {
    return of({
      success: true,
      message: 'Car images loaded.',
      data: this.carImages.filter((image) => image.carId === Number(carId))
    });
  }

  deleteImages(carImage: CarImage): Observable<ResponseModel> {
    this.carImages = this.carImages.filter((image) => image.imageId !== carImage.imageId);
    return of({ success: true, message: 'Image deleted.' });
  }
}
