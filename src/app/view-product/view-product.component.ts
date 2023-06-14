import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Product} from "../product";
import {ProductsService} from "../products.service";

@Component({
  selector: 'app-view-product',
  templateUrl: './view-product.component.html',
  styleUrls: ['./view-product.component.css']
})
export class ViewProductComponent implements OnInit {
  productShell: Product = {
    id: 0,
    name: '',
    make: '',
    price: 0,
  };

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      const id = String(param.get('id'));
      this.getById(id);
    });
  }

  getById(id: string) {
    this.productsService.getById(id).subscribe((data) => {
      this.productShell = data;
    });
  }

}
