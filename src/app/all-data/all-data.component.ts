import { Component, OnInit } from '@angular/core';
import { Student } from '../student';
import { StudentsService } from '../students.service';
import { MatDialog } from '@angular/material/dialog';
import { DeleteDialogStudentComponent } from '../delete-dialog-student/delete-dialog-student.component';
import { DeleteDialogProductComponent } from '../delete-dialog-product/delete-dialog-product.component';
import {Product} from "../product";
import {ProductsService} from "../products.service";

@Component({
  selector: 'app-all-students',
  templateUrl: './all-data.component.html',
  styleUrls: ['./all-data.component.css'],
})
export class AllDataComponent implements OnInit {
  allStudentsSource: Student[] = [];
  displayedStudentColumns: string[] = [
    'id',
    'firstName',
    'gender',
    'lastName',
    'age',
    'actions',
  ];

  allProductsSource: Product[] = [];
  displayedProductsColumns: string[] = [
    'id',
    'name',
    'make',
    'price',
    'actions',
  ];

  constructor(
    private studentService: StudentsService,
    private productsService: ProductsService,
    public dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getStudents();
    this.getProducts();
  }

  getStudents() {
    this.studentService.get().subscribe((data) => {
      this.allStudentsSource = data;
    });
  }

  getProducts() {
    this.productsService.get().subscribe((data) => {
      this.allProductsSource = data;
    });
  }

  openDeleteModalStudent(id: number) {
    const dialogRef = this.dialog.open(DeleteDialogStudentComponent, {
      width: '250px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allStudentsSource = this.allStudentsSource.filter(
          (_) => _.id !== id
        );
      }
    });
  }

  openDeleteModalProduct(id: number) {
    const dialogRef = this.dialog.open(DeleteDialogProductComponent, {
      width: '250px',
      data: { id },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.allProductsSource = this.allProductsSource.filter(
          (_) => _.id !== id
        );
      }
    });
  }
}
