import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ConfigService } from '../config.service';

@Injectable({
    providedIn: 'root',
})
export class ApiService {
    constructor(private http: HttpClient) {}

    get<T>(path: string, params: HttpParams = new HttpParams()): Observable<T> {
        return ConfigService.config$.pipe(
            switchMap((config) => this.http.get<T>(`${config.apiUrl}${path}`, { params }))
        );
    }

    put<T, R>(path: string, body: T): Observable<R> {
        return ConfigService.config$.pipe(
            switchMap((config) => this.http.put<R>(`${config.apiUrl}${path}`, body))
        );
    }

    patch<T, R>(path: string, body: Partial<T>): Observable<R> {
        return ConfigService.config$.pipe(
            switchMap((config) => this.http.patch<R>(`${config.apiUrl}${path}`, body))
        );
    }

    post<T, R>(path: string, body?: T): Observable<R> {
        return ConfigService.config$.pipe(
            switchMap((config) => this.http.post<R>(`${config.apiUrl}${path}`, body))
        );
    }

    delete<T>(path: string): Observable<T> {
        return ConfigService.config$.pipe(
            switchMap((config) => this.http.delete<T>(`${config.apiUrl}${path}`))
        );
    }
}
