import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CarAddComponent } from './components/pages/admin-dashboard/cars-dashboard/car-add/car-add.component';
import { CarDetailComponent } from './components/car-detail/car-detail.component';
import { CarComponent } from './components/car/car.component';
import { CreditCardComponent } from './components/creditcard/creditcard.component';
import { RentalComponent } from './components/rental/rental.component';
import { ColorAddComponent } from './components/pages/admin-dashboard/colors-dashboard/color-add/color-add.component';
import { ColorEditComponent } from './components/pages/admin-dashboard/colors-dashboard/color-edit/color-edit.component';
import { ColorsDashboardComponent } from './components/pages/admin-dashboard/colors-dashboard/colors-dashboard.component';
import { AdminDashboardComponent } from './components/pages/admin-dashboard/admin-dashboard.component';
import { AdminMetricsDashboardComponent } from './components/pages/admin-dashboard/metrics-dashboard/metrics-dashboard.component';
import { BrandAddComponent } from './components/pages/admin-dashboard/brands-dashboard/brand-add/brand-add.component';
import { CarEditComponent } from './components/pages/admin-dashboard/cars-dashboard/car-edit/car-edit.component';
import { BookingLookupComponent } from './components/booking-lookup/booking-lookup.component';
import { BrandsDashboardComponent } from './components/pages/admin-dashboard/brands-dashboard/brands-dashboard.component';
import { BrandEditComponent } from './components/pages/admin-dashboard/brands-dashboard/brand-edit/brand-edit.component';
import { CarsDashboardComponent } from './components/pages/admin-dashboard/cars-dashboard/cars-dashboard.component';
import { AdminBookingsComponent } from './components/pages/admin-dashboard/bookings-dashboard/bookings-dashboard.component';
import { AdminExtrasComponent } from './components/pages/admin-dashboard/extras-dashboard/extras-dashboard.component';
import { AdminPaymentsComponent } from './components/pages/admin-dashboard/payments-dashboard/payments-dashboard.component';
import { HomeComponent } from './components/home/home/home.component';
import { UserComponent } from './components/auth/user-profil/user-profil.component';
import { UsereditComponent } from './components/auth/user-profil/useredit/useredit.component';
import { BrandComponent } from './components/brand/brand.component';
import { LocalLoginComponent } from './components/auth/local-login/local-login.component';
import { LocalRegisterComponent } from './components/auth/local-register/local-register.component';
import { CustomerAccountComponent } from './components/account/customer-account/customer-account.component';
import { CustomerBookingsComponent } from './components/account/customer-bookings/customer-bookings.component';
import { CustomerAuthGuard } from './guards/customer-auth.guard';
import { AdminAuthGuard } from './guards/admin-auth.guard';
import { AdminLoginComponent } from './components/admin/admin-login/admin-login.component';
import { PaymentCheckoutComponent } from './components/payment/payment-checkout/payment-checkout.component';
import { BookingConfirmationComponent } from './components/booking-confirmation/booking-confirmation.component';

const routes: Routes = [
  { path: '', pathMatch: 'full', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'cars', component: CarComponent },
  { path: 'services', component: BrandComponent },
  { path: 'cars/brand/:brandId', component: CarComponent },
  { path: 'cars/color/:colorId', component: CarComponent },
  { path: 'cars/brand/:brandId/color/:colorId', component: CarComponent },
  { path: 'cars/filter/:brandId/:colorId', component: CarComponent },
  { path: 'cars/:carId', component: CarDetailComponent },
  { path: 'car/details/:carId', component: CarDetailComponent },
  { path: 'cars/car-detail/:carId', component: CarDetailComponent },
  { path: 'car/rental/:carId', component: RentalComponent },
  { path: 'booking-lookup', component: BookingLookupComponent },
  { path: 'payment/:bookingReference', component: PaymentCheckoutComponent },
  { path: 'booking-confirmation/:bookingReference', component: BookingConfirmationComponent },
  { path: 'creditcard/:rental', component: CreditCardComponent },
  { path: 'login', component: LocalLoginComponent },
  { path: 'register', component: LocalRegisterComponent },
  { path: 'account', component: CustomerAccountComponent, canActivate: [CustomerAuthGuard] },
  { path: 'account/bookings', component: CustomerBookingsComponent, canActivate: [CustomerAuthGuard] },
  { path: 'admin/login', component: AdminLoginComponent },
  { path: 'user', component: UserComponent, children: [{ path: 'edituser', component: UsereditComponent }] },
  {
    path: 'admin',
    component: AdminDashboardComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      { path: 'dashboard', component: AdminMetricsDashboardComponent },
      { path: 'cars', component: CarsDashboardComponent },
      { path: 'cars/add', component: CarAddComponent },
      { path: 'cars/edit/:carId', component: CarEditComponent },
      { path: 'brands', component: BrandsDashboardComponent },
      { path: 'brands/add', component: BrandAddComponent },
      { path: 'brands/edit/:brandId', component: BrandEditComponent },
      { path: 'colors', component: ColorsDashboardComponent },
      { path: 'colors/add', component: ColorAddComponent },
      { path: 'colors/edit/:colorId', component: ColorEditComponent },
      { path: 'bookings', component: AdminBookingsComponent },
      { path: 'extras', component: AdminExtrasComponent },
      { path: 'payments', component: AdminPaymentsComponent },
    ],
  },
  { path: '**', redirectTo: 'home' },
];

@NgModule({ imports: [RouterModule.forRoot(routes)], exports: [RouterModule] })
export class AppRoutingModule {}
