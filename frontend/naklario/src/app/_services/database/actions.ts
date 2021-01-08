import { Observable } from 'rxjs';

export interface Create<T, R> {
    create(object: T): Observable<R>;
}

export interface List<T> {
    list(): Observable<T[]>;
}

export interface Get<T, I> {
    read(id: I): Observable<T>;
}

export interface Update<T, R, I> {
    update(object: T, id: I): Observable<R>;
    patch(object: Partial<T>, id: I): Observable<R>;
}

export interface Delete<I> {
    delete(id: I): Observable<any>;
}
