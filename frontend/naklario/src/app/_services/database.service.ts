import { Injectable } from '@angular/core';
import { Observable, throwError, combineLatest } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';
import { of } from 'rxjs';
import {
    State,
    Subject,
    SchoolType,
    Gender,
    Constants,
    SendableSchoolData,
    sendableToLocalSchoolData,
    SchoolData,
} from '../_models';
import { ApiService } from './database/api.service';

@Injectable({ providedIn: 'root' })
export class DatabaseService {
    public states: Observable<State[]>;
    public subjects: Observable<Subject[]>;
    public schoolTypes: Observable<SchoolType[]>;
    public schoolData: Observable<SchoolData[]>;
    public genders: Observable<Gender[]>;

    private cache = {};

    constructor(private api: ApiService) {
        this.states = this.get<State[]>('/account/states/');
        this.subjects = this.get<Subject[]>('/account/subjects/');
        this.schoolTypes = this.get<SchoolType[]>('/account/schooltypes/');
        this.schoolData = combineLatest([
            this.schoolTypes,
            this.get<SendableSchoolData[]>('/account/schooldata/'),
        ]).pipe(
            map(([schoolTypes, schoolData]) =>
                schoolData.map((s) => sendableToLocalSchoolData(s, schoolTypes))
            )
        );

        this.genders = of(
            JSON.parse(
                '[{"id":1,"gender":"Weiblich", "shortcode": "FE"},{"id":2,"gender":"Männlich", "shortcode": "MA"},{"id":3,"gender":"Divers", "shortcode": "DI"}]'
            ) as Gender[]
        );
    }

    private get<T>(url: string): Observable<T> {
        if (this.cache[url]) {
            return this.cache[url];
        }
        this.cache[url] = this.api.get<T>(url, null, true).pipe(
            shareReplay(1),
            catchError((err) => {
                console.log('Database request error: ', err);
                delete this.cache[url];
                return throwError(err);
            })
        );
        return this.cache[url];
    }

    getSubject(id: string): Observable<Subject> {
        return this.get<Subject>(`/account/subjects/${id}/`);
    }

    public getConstants() {
        return combineLatest([
            this.states,
            this.subjects,
            this.schoolTypes,
            this.schoolData,
            this.genders,
        ]).pipe(map((value) => new Constants(...value)));
    }
}
