import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {Product} from "../product";
import {ProductsService} from "../products.service";

@Component({
  selector: 'app-add-product',
  templateUrl: './add-product.component.html',
  styleUrls: ['./add-product.component.css']
})
export class AddProductComponent implements OnInit {
  productForm: Product = {
    id: 0,
    name: '',
    make: '',
    price: 0,
  };

  constructor(
    private productsService: ProductsService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  create() {
    this.productsService.create(this.productForm).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
