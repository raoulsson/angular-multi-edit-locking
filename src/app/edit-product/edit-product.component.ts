import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {Product} from "../product";
import {ProductsService} from "../products.service";

@Component({
  selector: 'app-edit-product',
  templateUrl: './edit-product.component.html',
  styleUrls: ['./edit-product.component.css']
})
export class EditProductComponent implements OnInit {
  productForm: Product = {
    id: 0,
    name: '',
    make: '',
    price: 0
  };

  constructor(
    private productsService: ProductsService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((param) => {
      const id = String(param.get('id'));
      this.getById(id);
    });
  }

  getById(id: string) {
    this.productsService.getById(id).subscribe((data) => {
      this.productForm = data;
    });
  }

  update() {
    this.productsService.update(this.productForm).subscribe(() => {
      this.router.navigate(['/']);
    });
  }
}
