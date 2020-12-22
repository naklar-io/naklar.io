import { Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { mergeMap, switchMap } from 'rxjs/operators';
import { Sendable } from 'src/app/_models';
import { TimeSlot } from 'src/app/_models/scheduling';
import { Create, Delete, Get, List, Update } from '../actions';
import { ApiService } from '../api.service';
import { TransformationService } from '../transformation.service';

const BASE_URL = '/scheduling/timeslot/';
@Injectable({
    providedIn: 'root',
})
export class TimeslotService
    implements
        Get<TimeSlot, number>,
        List<TimeSlot>,
        Create<TimeSlot, TimeSlot>,
        Delete<number>,
        Update<TimeSlot, TimeSlot, number> {
    private deserialize: (timeSlot: Sendable<TimeSlot>) => Observable<TimeSlot>;
    private serialize: (timeSlot: TimeSlot) => Sendable<TimeSlot>;

    constructor(private api: ApiService, private transform: TransformationService) {
        this.deserialize = ((timeSlot: Sendable<TimeSlot>) =>
            this.transform.toLocal(new TimeSlot(), timeSlot)).bind(this);
        this.serialize = ((timeSlot: TimeSlot) => timeSlot.serialize(this.transform)).bind(this);
    }

    read(id: number): Observable<TimeSlot> {
        return this.api
            .get<Sendable<TimeSlot>>(`${BASE_URL}${id}/`)
            .pipe(mergeMap(this.deserialize));
    }
    list(): Observable<TimeSlot[]> {
        return this.api.get<Sendable<TimeSlot>[]>(`${BASE_URL}`).pipe(
            switchMap((app) => {
                if (app.length > 0) {
                    return forkJoin(app.map(this.deserialize));
                } else {
                    return [];
                }
            })
        );
    }
    create(object: TimeSlot): Observable<TimeSlot> {
        return this.api
            .post<Sendable<TimeSlot>, Sendable<TimeSlot>>(`${BASE_URL}`, this.serialize(object))
            .pipe(mergeMap(this.deserialize));
    }
    delete(id: number): Observable<any> {
        return this.api.delete(`${BASE_URL}${id}/`);
    }
    update(object: TimeSlot, id: number): Observable<TimeSlot> {
        return this.api
            .put<Sendable<TimeSlot>, Sendable<TimeSlot>>(
                `${BASE_URL}${id}/`,
                this.serialize(object)
            )
            .pipe(mergeMap(this.deserialize));
    }
    patch(object: Partial<TimeSlot>, id: number): Observable<TimeSlot> {
        return this.api
            .put<Partial<Sendable<TimeSlot>>, Sendable<TimeSlot>>(
                `${BASE_URL}${id}/`,
                object.serialize(this.transform)
            )
            .pipe(mergeMap(this.deserialize));
    }
}
