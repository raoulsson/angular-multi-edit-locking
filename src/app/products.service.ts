import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';
import {Product} from "./product";

@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  constructor(private httpClient: HttpClient) {
  }

  get(): Observable<Product[]> {
    return this.httpClient.get<Product[]>('http://localhost:3000/api/products');
  }

  create(payload: Product) {
    return this.httpClient.post<Product>(
      'http://localhost:3000/api/products',
      payload
    );
  }

  getById(id: string): Observable<Product> {
    return this.httpClient.get<Product>(`http://localhost:3000/api/products/${id}`);
  }

  update(payload: Product): Observable<Product> {
    return this.httpClient.put<Product>(
      `http://localhost:3000/api/products/${payload.id}`,
      payload
    );
  }

  delete(id: string) {
    return this.httpClient.delete(`http://localhost:3000/api/products/${id}`);
  }
}
