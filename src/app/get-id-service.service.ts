import { Injectable } from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Observable} from "rxjs";
import {Product} from "./product";

@Injectable({
  providedIn: 'root'
})
export class GetIdServiceService {

  constructor(private httpClient: HttpClient) {
  }

  async get(): Promise<string | undefined> {
    return await this.httpClient.get<string>('http://localhost:3000/api/getClientId').toPromise();
  }

}
