import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Student } from './student';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StudentsService {
  constructor(private httpClient: HttpClient) {}

  get(): Observable<Student[]> {
    headers: new HttpHeaders({
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Expires': 'Sat, 01 Jan 2000 00:00:00 GMT'
    })
    return this.httpClient.get<Student[]>('http://localhost:3000/api/students');
  }

  create(payload: Student) {
    return this.httpClient.post<Student>(
      'http://localhost:3000/api/students',
      payload
    );
  }

  getById(id: string): Observable<Student> {
    return this.httpClient.get<Student>(`http://localhost:3000/api/students/${id}`);
  }

  update(payload: Student): Observable<Student> {
    return this.httpClient.put<Student>(
      `http://localhost:3000/api/students/${payload.id}`,
      payload
    );
  }

  delete(id: string) {
    return this.httpClient.delete(`http://localhost:3000/api/students/${id}`);
  }
}
