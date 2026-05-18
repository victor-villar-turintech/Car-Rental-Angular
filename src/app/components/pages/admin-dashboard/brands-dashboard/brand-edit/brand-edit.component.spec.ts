import { ToastrService } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BrandEditComponent } from './brand-edit.component';

describe('BrandEditComponent', () => {
  let component: BrandEditComponent;
  let fixture: ComponentFixture<BrandEditComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BrandEditComponent ],
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
    fixture = TestBed.createComponent(BrandEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
