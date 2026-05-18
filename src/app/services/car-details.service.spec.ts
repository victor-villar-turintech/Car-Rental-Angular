import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { CarDetailsService } from './car-details.service';

describe('CarDetailsService', () => {
  let service: CarDetailsService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA],
      providers: [{
        provide: ToastrService,
        useValue: {
          success: () => {},
          error: () => {},
          info: () => {},
          warning: () => {}
        }
      }]
    });
    service = TestBed.inject(CarDetailsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
