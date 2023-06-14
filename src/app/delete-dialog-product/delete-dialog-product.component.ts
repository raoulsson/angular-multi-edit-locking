import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ProductsService } from '../products.service';

@Component({
  selector: 'app-delete-dialog-product',
  templateUrl: './delete-dialog-product.component.html',
  styleUrls: ['./delete-dialog-product.component.css'],
})
export class DeleteDialogProductComponent implements OnInit {
  constructor(
    public dialogRef: MatDialogRef<DeleteDialogProductComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private productsService: ProductsService
  ) {}

  ngOnInit(): void {}

  confirmDelete() {
   this.productsService.delete(this.data.id).subscribe(() => {
      this.dialogRef.close(this.data.id);
    });
  }
}
