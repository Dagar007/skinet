import { Component, OnInit, Input } from '@angular/core';
import { IProduct } from 'src/app/shared/models/product';

@Component({
  selector: 'app-product-items',
  templateUrl: './product-items.component.html',
  styleUrls: ['./product-items.component.scss']
})
export class ProductItemsComponent implements OnInit {
  @Input() product: IProduct;
  constructor() { }

  ngOnInit(): void {
  }

}
