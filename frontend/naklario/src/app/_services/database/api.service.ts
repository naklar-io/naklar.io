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
    constructor(private http: HttpClient, private config: ConfigService) {}

    get<T>(path: string, params: HttpParams = new HttpParams(), ignoreLoading: boolean = false): Observable<T> {
        let headers: any= {};
        if (ignoreLoading) {
          headers.ignoreLoadingBar = true;
        }
        return this.config.apiURL.pipe(
            switchMap((url) => this.http.get<T>(`${url}${path}`, {headers: headers, params: params}))
        );
    }

    put<T, R>(path: string, body: T): Observable<R> {
        return this.config.apiURL.pipe(switchMap((url) => this.http.put<R>(`${url}${path}`, body)));
    }

    patch<T, R>(path: string, body: Partial<T>): Observable<R> {
        return this.config.apiURL.pipe(
            switchMap((url) => this.http.patch<R>(`${url}${path}`, body))
        );
    }

    post<T, R>(path: string, body?: T): Observable<R> {
        return this.config.apiURL.pipe(
            switchMap((url) => this.http.post<R>(`${url}${path}`, body))
        );
    }

    delete<T>(path: string): Observable<T> {
        return this.config.apiURL.pipe(switchMap((url) => this.http.delete<T>(`${url}${path}`)));
    }
}
