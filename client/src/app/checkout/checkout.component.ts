import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from '../account/account.service';
import { IAddress } from '../shared/models/address';
import { BasketService } from '../basket/basket.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit {

  checkoutForm: FormGroup;
  constructor(private fb: FormBuilder, private accountService: AccountService, private basketService: BasketService) { }

  ngOnInit(): void {
    this.createCheckoutForm();
    this.getUserAddress();
    this.getDeliveryMethodValue();
  }

  createCheckoutForm() {
    this.checkoutForm = this.fb.group({
      addressForm: this.fb.group({
        firstName: [null, Validators.required],
        lastName: [null, Validators.required],
        street: [null, Validators.required],
        city: [null, Validators.required],
        state: [null, Validators.required],
        zipcode: [null, Validators.required],
      }),
      deliveryForm: this.fb.group({
        deliveryMethod: [null, Validators.required]
      }),
      paymentForm: this.fb.group({
        nameOnCard: [null, Validators.required]
      })
    });
  }

  getUserAddress() {
    this.accountService.getUserAddress().subscribe((address: IAddress) => {
      if (address) {
        this.checkoutForm.get('addressForm').patchValue(address);
      }
    }, err => {
      console.log(err);
    });
  }
  getDeliveryMethodValue() {
    const basket = this.basketService.getCurrentBasketValue();
    if (basket.deliveryMethodId !== null) {
      this.checkoutForm.get('deliveryForm').get('deliveryMethod').patchValue(basket.deliveryMethodId.toString());
    }
  }
}
