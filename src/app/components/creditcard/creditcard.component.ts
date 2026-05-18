import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { CreditCard } from 'src/app/models/creditCard';
import { Rental } from 'src/app/models/rental';
import { creditCardService } from 'src/app/services/creditcard.service';
import { RentalService } from 'src/app/services/rental.service';

@Component({
  selector: 'app-creditcard',
  templateUrl: './creditcard.component.html',
  styleUrls: ['./creditcard.component.css']
})
export class CreditCardComponent implements OnInit {
  rental: Rental;
  nameOnTheCard = 'Demo User';
  cardNumber = '4111111111111111';
  cardCvv = '123';
  cardExpiration = '12/30';
  paymentCompleted = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private creditCardService: creditCardService,
    private rentalService: RentalService,
    private toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.activatedRoute.params.subscribe((params) => {
      if (params.rental) {
        this.rental = JSON.parse(params.rental);
      }
    });
  }

  rentACar(): void {
    const creditCard: CreditCard = {
      cardName: this.nameOnTheCard,
      cardNumber: this.cardNumber,
      cardCvc: this.cardCvv,
      cardExpiration: this.cardExpiration
    };

    this.creditCardService.isCardExist(creditCard).subscribe((cardResponse) => {
      if (!cardResponse.success) {
        this.toastrService.error('Your bank did not approve your details', 'Card not found');
        return;
      }

      this.rentalService.addRental(this.rental).subscribe(() => {
        this.paymentCompleted = true;
        this.toastrService.success('You rented the car', 'Operation successful');
      });
    });
  }

  backToCars(): void {
    this.router.navigate(['/cars']);
  }
}
