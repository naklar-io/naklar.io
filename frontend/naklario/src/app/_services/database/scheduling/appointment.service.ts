import { Injectable } from '@angular/core';
import { formatISO, parseISO } from 'date-fns';
import { BehaviorSubject, forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { JoinResponse, Sendable, Subject } from 'src/app/_models';
import { Appointment, CreateAppointment } from 'src/app/_models/scheduling';
import { DatabaseService } from '../../database.service';
import { UserService } from '../account/user.service';
import { Create, Get, List } from '../actions';
import { ApiService } from '../api.service';
import { TransformationService } from '../transformation.service';
import { deserializeDuration } from './utils';

@Injectable({
    providedIn: 'root',
})
export class AppointmentService
    implements Create<CreateAppointment, Appointment>, List<Appointment>, Get<Appointment, number> {
    private deserialize;
    private appointmentCreatedSubject = new BehaviorSubject(null);
    appointmentCreated$ = this.appointmentCreatedSubject.asObservable();

    constructor(
        private api: ApiService,
        private user: UserService,
        private db: DatabaseService,
        private transform: TransformationService
    ) {
        this.deserialize = this.transform.deserializeAppointment.bind(this.transform);
    }

    create(object: CreateAppointment): Observable<Appointment> {
        return this.api
            .post<Sendable<CreateAppointment>, Sendable<Appointment>>(
                '/scheduling/appointment/',
                object.serialize(this.transform)
            )
            .pipe(mergeMap(this.deserialize), tap(_ => this.appointmentCreatedSubject.next(null)));
    }

    list(): Observable<Appointment[]> {
        return this.api.get<any>('/scheduling/appointment/').pipe(
            switchMap((appointments) => {
                if (appointments.length > 0) {
                    return forkJoin(appointments.map(this.deserialize));
                }
                return [appointments];
            })
        );
    }

    read(id: number): Observable<Appointment> {
        return this.api
            .get<Sendable<Appointment>>(`/scheduling/appointment/${id}/`)
            .pipe(mergeMap(this.deserialize));
    }

    accept(id: number): Observable<Appointment> {
        return this.api
            .post(`/scheduling/appointment/${id}/accept/`, {})
            .pipe(mergeMap(this.deserialize));
    }

    reject(id: number): Observable<any> {
        return this.api.post(`/scheduling/appointment/${id}/reject/`, {});
    }

    startMeeting(id: number): Observable<JoinResponse> {
        return this.api.post<any, JoinResponse>(`/scheduling/appointment/${id}/start_meeting/`, {});
    }
}
