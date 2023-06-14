import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {AddStudentComponent} from './add-student/add-student.component';
import {AllDataComponent} from './all-data/all-data.component';
import {EditStudentComponent} from './edit-student/edit-student.component';
import {ViewStudentComponent} from './view-student/view-student.component';
import {EditPanelComponent} from "./edit-panel/edit-panel.component";
import {StudentsComboComponent} from "./students-combo/students-combo.component";
import {ProductsComboComponent} from "./product-combo/products-combo.component";
import {AddProductComponent} from "./add-product/add-product.component";
import {ViewProductComponent} from "./view-product/view-product.component";
import {ChatComponent} from "./chat/chat.component";

const routes: Routes = [
  {
    path: '',
    component: AllDataComponent,
  },
  {
    path: 'add-student',
    component: AddStudentComponent,
  },
  {
    path: 'add-product',
    component: AddProductComponent,
  },
  {
    path: 'edit-student/:id',
    component: EditStudentComponent,
  },
  {
    path: 'view-student/:id',
    component: ViewStudentComponent,
  },
  {
    path: 'view-product/:id',
    component: ViewProductComponent,
  },
  {
    path: 'edit-panel/:id',
    component: EditPanelComponent,
  },
  {
    path: 'students-combo/:id',
    component: StudentsComboComponent,
  },
  {
    path: 'products-combo/:id',
    component: ProductsComboComponent,
  },
  {
    path: 'chat',
    component: ChatComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {
}
