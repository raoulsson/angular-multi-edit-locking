import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MatToolbarModule} from '@angular/material/toolbar';
import {AllDataComponent} from './all-data/all-data.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {MatTableModule} from '@angular/material/table';
import {AddStudentComponent} from './add-student/add-student.component';
import {MatFormFieldModule} from '@angular/material/form-field';
import {MatInputModule} from '@angular/material/input';
import {MatCardModule} from '@angular/material/card';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import {FormsModule} from '@angular/forms';
import {EditStudentComponent} from './edit-student/edit-student.component';
import {MatIconModule} from '@angular/material/icon';
import {DeleteDialogStudentComponent} from './delete-dialog-student/delete-dialog-student.component';
import {DeleteDialogProductComponent} from './delete-dialog-product/delete-dialog-product.component';
import {MatDialogModule} from '@angular/material/dialog';
import {ViewStudentComponent} from './view-student/view-student.component';
import {EditPanelComponent} from './edit-panel/edit-panel.component';
import { StudentsComboComponent } from './students-combo/students-combo.component';
import { ProductsComboComponent } from './product-combo/products-combo.component';
import { ViewProductComponent } from './view-product/view-product.component';
import { EditProductComponent } from './edit-product/edit-product.component';
import { AddProductComponent } from './add-product/add-product.component';
import {NoCacheHeadersInterceptor} from "./NoCacheHeadersInterceptor";
import { ChatComponent } from './chat/chat.component';


@NgModule({
  declarations: [AppComponent, AllDataComponent, AddStudentComponent, EditStudentComponent, DeleteDialogStudentComponent, DeleteDialogProductComponent, ViewStudentComponent, EditPanelComponent, StudentsComboComponent, ProductsComboComponent, ViewProductComponent, EditProductComponent, AddProductComponent, ChatComponent],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    HttpClientModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatCardModule,
    MatSelectModule,
    MatButtonModule,
    FormsModule,
    MatIconModule,
    MatDialogModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: NoCacheHeadersInterceptor,
      multi: true
    },
  ],
  bootstrap: [AppComponent],
  // bootstrap: [EditPanelComponent],
})
export class AppModule {
}
