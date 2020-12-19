import { Injectable } from '@angular/core';
import { formatISO, parseISO } from 'date-fns';
import { forkJoin, Observable, of } from 'rxjs';
import { map, mergeMap, switchMap } from 'rxjs/operators';
import { JoinResponse, Sendable } from 'src/app/_models';
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
    constructor(
        private api: ApiService,
        private user: UserService,
        private db: DatabaseService,
        private transform: TransformationService
    ) {
      this.deserialize = this.transform.deserializeAppointment.bind(this.transform);
    }

    create(object: CreateAppointment): Observable<Appointment> {
        return this.api.post<Sendable<CreateAppointment>, Appointment>('/scheduling/appointment/', object.serialize(this.transform));
        
    }

    list(): Observable<Appointment[]> {
        return this.api.get<any>('/scheduling/appointment/').pipe(
            switchMap((appointments) => {
                if (appointments.length > 0) {
                    return forkJoin(
                        appointments.map(this.deserialize)
                    );
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

    private transformCreateAppointmentToSend(object: CreateAppointment): any {
        return {};
    }

    private transformAppointment(object: Appointment): Observable<Appointment> {
        const owner = this.user.read(object.owner.toString());
        const invitee = this.user.read(object.invitee.toString());
        const subject = this.db.getSubject(object.subject.toString());
        const startTime = of(parseISO(object.startTime.toString()));
        const duration = of(deserializeDuration(object.duration.toString()));
        return forkJoin({
            owner,
            invitee,
            subject,
            startTime,
            duration,
        }).pipe(
            map((values) => {
                return Object.assign(object, values);
            })
        );
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
