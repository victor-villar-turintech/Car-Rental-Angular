import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { CreditCard } from '../models/creditCard';
import { ListResponseModel } from '../models/listResponseModel';
import { ResponseModel } from '../models/responseModel';

@Injectable({ providedIn: 'root' })
export class creditCardService {
  private cards: CreditCard[] = [
    {
      id: 1,
      cardName: 'Demo User',
      cardNumber: '4111111111111111',
      cardCvc: '123',
      cardExpiration: '12/30',
      moneyInTheCard: 10000
    }
  ];

  isCardExist(creditCard: CreditCard): Observable<ResponseModel> {
    const card = this.findCard(creditCard.cardNumber);
    return of({ success: !!card || !!creditCard.cardNumber, message: 'Card accepted in demo mode.' });
  }

  getCardByNumber(cardNumber: string): Observable<ListResponseModel<CreditCard>> {
    const card = this.findCard(cardNumber) || {
      id: 999,
      cardName: 'Demo User',
      cardNumber,
      cardCvc: '123',
      cardExpiration: '12/30',
      moneyInTheCard: 10000
    };

    return of({ success: true, message: 'Card loaded.', data: [card] });
  }

  updateCard(creditCard: CreditCard): Observable<ResponseModel> {
    this.cards = this.cards.map((card) => card.cardNumber === creditCard.cardNumber ? { ...card, ...creditCard } : card);
    return of({ success: true, message: 'Card updated.' });
  }

  private findCard(cardNumber: string): CreditCard | undefined {
    return this.cards.find((card) => card.cardNumber === cardNumber);
  }
}
