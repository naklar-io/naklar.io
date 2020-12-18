import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(private http: HttpClient) {
  }

  get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
    return this.http.get<T>(`${environment.apiUrl}${path}`, { params });
  }

  put<T, R>(path: string, body: T): Observable<R> {
    return this.http.put<R>(`${environment.apiUrl}${path}`, body);
  }

  patch<T, R>(path: string, body: Partial<T>): Observable<R> {
    return this.http.patch<R>(`${environment.apiUrl}${path}`, body);
  }

  post<T, R>(path: string, body: T): Observable<R> {
    return this.http.post<R>(`${environment.apiUrl}${path}`, body);
  }

  delete<T>(path: string): Observable<T> {
    return this.http.delete<T>(`${environment.apiUrl}${path}`);
  }
  
}
