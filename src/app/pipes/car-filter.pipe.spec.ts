import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { CarFilterPipe } from './car-filter.pipe';

describe('CarFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new CarFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
