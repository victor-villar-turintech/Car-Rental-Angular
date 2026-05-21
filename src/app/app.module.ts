import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JwtModule } from '@auth0/angular-jwt';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { ToastrModule } from 'ngx-toastr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { NaviComponent } from './components/navi/navi.component';
import { FooterComponent } from './components/footer/footer.component';
import { HomeComponent } from './components/home/home/home.component';
import { CustomerComponent } from './components/customer/customer.component';
import { RentalComponent } from './components/rental/rental.component';
import { BookingLookupComponent } from './components/booking-lookup/booking-lookup.component';
import { ColorComponent } from './components/color/color.component';
import { CarComponent } from './components/car/car.component';
import { BrandComponent } from './components/brand/brand.component';
import { CarDetailComponent } from './components/car-detail/car-detail.component';
import { CarFilterComponent } from './components/car-filter/car-filter.component';
import { CreditCardComponent } from './components/creditcard/creditcard.component';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { UserComponent } from './components/auth/user-profil/user-profil.component';
import { UsereditComponent } from './components/auth/user-profil/useredit/useredit.component';
import { LocalLoginComponent } from './components/auth/local-login/local-login.component';
import { LocalRegisterComponent } from './components/auth/local-register/local-register.component';
import { CustomerAccountComponent } from './components/account/customer-account/customer-account.component';
import { CustomerBookingsComponent } from './components/account/customer-bookings/customer-bookings.component';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { PaymentCheckoutComponent } from './components/payment/payment-checkout/payment-checkout.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { AdminMetricsDashboardComponent } from './components/pages/admin-dashboard/metrics-dashboard/metrics-dashboard.component';
import { ColorsDashboardComponent } from './components/pages/admin-dashboard/colors-dashboard/colors-dashboard.component';
import { ColorAddComponent } from './components/pages/admin-dashboard/colors-dashboard/color-add/color-add.component';
import { ColorEditComponent } from './components/pages/admin-dashboard/colors-dashboard/color-edit/color-edit.component';
import { BrandsDashboardComponent } from './components/pages/admin-dashboard/brands-dashboard/brands-dashboard.component';
import { BrandAddComponent } from './components/pages/admin-dashboard/brands-dashboard/brand-add/brand-add.component';
import { BrandEditComponent } from './components/pages/admin-dashboard/brands-dashboard/brand-edit/brand-edit.component';
import { CarsDashboardComponent } from './components/pages/admin-dashboard/cars-dashboard/cars-dashboard.component';
import { CarAddComponent } from './components/pages/admin-dashboard/cars-dashboard/car-add/car-add.component';
import { CarEditComponent } from './components/pages/admin-dashboard/cars-dashboard/car-edit/car-edit.component';
import { AdminBookingsComponent } from './components/pages/admin-dashboard/bookings-dashboard/bookings-dashboard.component';
import { AdminExtrasComponent } from './components/pages/admin-dashboard/extras-dashboard/extras-dashboard.component';
import { AdminPaymentsComponent } from './components/pages/admin-dashboard/payments-dashboard/payments-dashboard.component';
import { AdminActivityDashboardComponent } from './components/pages/admin-dashboard/activity-dashboard/activity-dashboard.component';
import { AdminSettingsDashboardComponent } from './components/pages/admin-dashboard/settings-dashboard/settings-dashboard.component';

import { ColorFilterPipe } from './pipes/color-filter.pipe';
import { BrandFilterPipe } from './pipes/brand-filter.pipe';
import { CarFilterPipe } from './pipes/car-filter.pipe';
import { FormErrorComponent } from './components/shared/form-error/form-error.component';
import { ValidationSummaryComponent } from './components/shared/validation-summary/validation-summary.component';
import { StatusBadgeComponent } from './components/shared/status-badge/status-badge.component';
import { PriceBreakdownComponent } from './components/shared/price-breakdown/price-breakdown.component';
import { BackToTopComponent } from './components/shared/back-to-top/back-to-top.component';
import { CustomerActivityComponent } from './components/account/customer-activity/customer-activity.component';
import { CustomerRewardsComponent } from './components/account/customer-rewards/customer-rewards.component';
import { AdminDiscountsDashboardComponent } from './components/pages/admin-dashboard/discounts-dashboard/discounts-dashboard.component';
import { AdminRewardsDashboardComponent } from './components/pages/admin-dashboard/rewards-dashboard/rewards-dashboard.component';
import { AdminCustomerActivityDashboardComponent } from './components/pages/admin-dashboard/customer-activity-dashboard/customer-activity-dashboard.component';
import { AdminCustomersDashboardComponent } from './components/pages/admin-dashboard/customers-dashboard/customers-dashboard.component';
import { ConfirmDialogComponent } from './components/shared/confirm-dialog/confirm-dialog.component';
import { AdminRewardSettingsComponent } from './components/pages/admin-dashboard/reward-settings/reward-settings.component';
import { AdminDiscountAnalyticsComponent } from './components/pages/admin-dashboard/discount-analytics/discount-analytics.component';
import { VehicleComparisonComponent } from './components/vehicle-comparison/vehicle-comparison.component';
import { EmptyStateComponent } from './components/shared/empty-state/empty-state.component';
import { CustomerFavouritesComponent } from './components/account/customer-favourites/customer-favourites.component';
import { VehicleCatalogueComponent } from './components/pages/admin-vehicle-catalogue/vehicle-catalogue.component';
import { FleetComponent } from './components/pages/admin-fleet/fleet.component';
import { FleetAwareRentalFlowComponent } from './components/pages/fleet-aware-rental-flow/fleet-aware-rental-flow.component';

export function tokenGetter() {
  return localStorage.getItem('token');
}

@NgModule({
  declarations: [
    FleetAwareRentalFlowComponent,
    FleetComponent,
    VehicleCatalogueComponent,
    CustomerFavouritesComponent,
    ConfirmDialogComponent,
    AdminRewardSettingsComponent,
    AdminDiscountAnalyticsComponent,
    VehicleComparisonComponent,
    AppComponent,
    NaviComponent,
    FooterComponent,
    HomeComponent,
    CustomerComponent,
    RentalComponent,
    BookingLookupComponent,
    ColorComponent,
    CarComponent,
    BrandComponent,
    CarDetailComponent,
    CarFilterComponent,
    CreditCardComponent,
    LoginComponent,
    RegisterComponent,
    UserComponent,
    UsereditComponent,
    LocalLoginComponent,
    LocalRegisterComponent,
    CustomerAccountComponent,
    CustomerBookingsComponent,
    AdminLoginComponent,
    PaymentCheckoutComponent,
    BookingConfirmationComponent,
    AdminDashboardComponent,
    AdminMetricsDashboardComponent,
    ColorsDashboardComponent,
    ColorAddComponent,
    ColorEditComponent,
    BrandsDashboardComponent,
    BrandAddComponent,
    BrandEditComponent,
    CarsDashboardComponent,
    CarAddComponent,
    CarEditComponent,
    AdminBookingsComponent,
    AdminExtrasComponent,
    AdminPaymentsComponent,
    AdminActivityDashboardComponent,
    AdminSettingsDashboardComponent,
    ColorFilterPipe,
    BrandFilterPipe,
    CarFilterPipe,
    FormErrorComponent,
    ValidationSummaryComponent,
    StatusBadgeComponent,
    PriceBreakdownComponent,
    BackToTopComponent,
    EmptyStateComponent,
    CustomerActivityComponent,
    CustomerRewardsComponent,
    AdminDiscountsDashboardComponent,
    AdminRewardsDashboardComponent,
    AdminCustomerActivityDashboardComponent,
    AdminCustomersDashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    NgMultiSelectDropDownModule.forRoot(),
    ToastrModule.forRoot({ positionClass: 'toast-bottom-right' }),
    JwtModule.forRoot({ config: { tokenGetter } }),
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }],
  bootstrap: [AppComponent],
})
export class AppModule {}
