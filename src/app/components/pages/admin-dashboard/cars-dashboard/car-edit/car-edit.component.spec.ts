import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CarEditComponent } from './car-edit.component';

describe('CarEditComponent', () => {
  let component: CarEditComponent;
  let fixture: ComponentFixture<CarEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CarEditComponent ],
      imports: [HttpClientTestingModule, RouterTestingModule, ReactiveFormsModule, FormsModule, BrowserAnimationsModule, ToastrModule.forRoot()],
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
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CarEditComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
