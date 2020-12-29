import { Injectable } from '@angular/core';
import { BehaviorSubject, merge, Observable } from 'rxjs';
import { share, tap } from 'rxjs/operators';
import { AccessCode } from 'src/app/_models';
import { List } from '../actions';
import { ApiService } from '../api.service';

const BASE_URL = '/account/access-code/';

@Injectable({
    providedIn: 'root',
})
export class AccessCodeService implements List<AccessCode> {
    private availableCodesSubject = new BehaviorSubject<AccessCode[]>([]);
    availableCodes$ = this.availableCodesSubject.asObservable();

    constructor(private api: ApiService) {}

    list(): Observable<AccessCode[]> {
        return merge(
            this.api
                .get<AccessCode[]>(BASE_URL)
                .pipe(tap((x) => this.availableCodesSubject.next(x))),
            this.availableCodes$
        );
    }

    redeemCode(code: string): Observable<AccessCode> {
        return this.api.post<null, AccessCode>(`${BASE_URL}${code}/redeem/`);
    }
}
