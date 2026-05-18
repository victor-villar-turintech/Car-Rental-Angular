import { ToastrService } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ColorFilterPipe } from './color-filter.pipe';

describe('ColorFilterPipe', () => {
  it('create an instance', () => {
    const pipe = new ColorFilterPipe();
    expect(pipe).toBeTruthy();
  });
});
