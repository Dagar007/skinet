import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { IBasket, IBasketItem, Basket, IBasketTotals } from '../shared/models/basket';
import { map } from 'rxjs/operators';
import { IProduct } from '../shared/models/product';
import { IDeliveryMethod } from '../shared/models/deliveryMethhod';


@Injectable({
  providedIn: 'root'
})
export class BasketService {
  baseUrl = environment.apiUrl;
  private basketSoruce = new BehaviorSubject<IBasket>(null);
  basket$ = this.basketSoruce.asObservable();
  private basketTotalSource = new BehaviorSubject<IBasketTotals>(null);
  basketTotal$ = this.basketTotalSource.asObservable();
  shipping = 0;
  constructor(private http: HttpClient) { }

  setShippingPrice(deliveryMethod: IDeliveryMethod) {
    this.shipping = deliveryMethod.price;
    this.calculateTotals();
  }
  getBasket(id: string) {
    return this.http.get(this.baseUrl + 'basket?id=' + id).pipe(
      map((basket: IBasket) => {
        this.basketSoruce.next(basket);
        this.calculateTotals();
      })
    );
  }

  setBasket(basket: IBasket) {
    return this.http.post(this.baseUrl + 'basket', basket).subscribe((respponse: IBasket) => {
      this.basketSoruce.next(respponse);
      this.calculateTotals();
    }, err => {
      console.log(err);
    });
  }

  getCurrentBasketValue() {
    return this.basketSoruce.value;
  }

  addItemToBasket(item: IProduct, quantity = 1) {
    const itemToAdd: IBasketItem = this.mapProductItemToBasketItem(item, quantity);
    const basket = this.getCurrentBasketValue() ?? this.createBasket();
    basket.items = this.addOrUpdateItem(basket.items, itemToAdd, quantity);
    this.setBasket(basket);
  }

  incrementItemQuantity(item: IBasketItem) {
    const basket = this.getCurrentBasketValue();
    const foundItdexItem = basket.items.findIndex(x => x.id === item.id);
    basket.items[foundItdexItem].quantity++;
    this.setBasket(basket);
  }

  decrementItemQuantity(item: IBasketItem) {
    const basket = this.getCurrentBasketValue();
    const foundItdexItem = basket.items.findIndex(x => x.id === item.id);
    if (basket.items[foundItdexItem].quantity > 1) {
      basket.items[foundItdexItem].quantity--;
      this.setBasket(basket);
    } else {
      this.removeItemFromBasket(item);
    }
  }

  removeItemFromBasket(item: IBasketItem) {
    const basket = this.getCurrentBasketValue();
    if (basket.items.some(x => x.id === item.id)) {
      basket.items = basket.items.filter(i => i.id !== item.id);
      if (basket.items.length > 0) {
        this.setBasket(basket);
      } else {
        this.deletebasket(basket);
      }
    }
  }

  deleteLocalBasket(id: string) {
    this.basketSoruce.next(null);
    this.basketTotalSource.next(null);
    localStorage.removeItem('basket_id');
  }

  deletebasket(basket: IBasket) {
    return this.http.delete(this.baseUrl + 'basket?id=' + basket.id).subscribe(() => {
      this.basketSoruce.next(null);
      this.basketTotalSource.next(null);
      localStorage.removeItem('basket_id');
    }, err => {
      console.log(err);
    });
  }

  private calculateTotals() {
    const basket = this.getCurrentBasketValue();
    const shipping = this.shipping;
    const subtotal = basket.items.reduce((a, b) => (b.price * b.quantity) + a, 0);
    const total = shipping + subtotal;
    this.basketTotalSource.next({shipping , total, subtotal});
  }

  private addOrUpdateItem(items: IBasketItem[], itemToAdd: IBasketItem, quantity: number): IBasketItem[] {
    const index = items.findIndex(i => i.id === itemToAdd.id);
    if (index === -1) {
      itemToAdd.quantity = quantity;
      items.push(itemToAdd);
    } else {
      items[index].quantity += quantity;
    }
    return items;
  }
  private createBasket(): IBasket {
    const basket = new Basket();
    localStorage.setItem('basket_id', basket.id);
    return basket;
  }
  private mapProductItemToBasketItem(item: IProduct, quantity: number): IBasketItem {
    return {
      id: item.id,
      name: item.name,
      price: item.price,
      pictureUrl: item.pictureUrl,
      quantity,
      brand: item.productBrand,
      type: item.productType
    };
  }
}
