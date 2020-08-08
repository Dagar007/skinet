import { Component, OnInit } from '@angular/core';
import { IOrder } from 'src/app/shared/models/order';
import { ActivatedRoute } from '@angular/router';
import { BreadcrumbService } from 'xng-breadcrumb';
import { OrderService } from '../order.service';

@Component({
  selector: 'app-order-detailed',
  templateUrl: './order-detailed.component.html',
  styleUrls: ['./order-detailed.component.scss']
})
export class OrderDetailedComponent implements OnInit {
  order: IOrder;
  constructor(private route: ActivatedRoute, private bs: BreadcrumbService, private orderService: OrderService) {
    this.bs.set('@OrderDetailed', '');
  }

  ngOnInit(): void {
    this.orderService.getOrderDetailed(+this.route.snapshot.paramMap.get('id')).subscribe((order: IOrder) => {
      this.order = order;
      this.bs.set('@OrderDetailed', `Order# ${order.id} - ${order.status}`);
    }, err => {
      console.log(err);
    });
  }

}
