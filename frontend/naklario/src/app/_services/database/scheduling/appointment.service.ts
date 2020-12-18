import { join } from '@angular/compiler-cli/src/ngtsc/file_system';
import { Injectable } from '@angular/core';
import { constants } from 'buffer';
import { parse, parseISO } from 'date-fns';
import { combineLatest, forkJoin, merge, Observable, of } from 'rxjs';
import { combineAll, concatAll, map, mergeAll, mergeMap, mergeMapTo, switchMap } from 'rxjs/operators';
import { JoinResponse } from 'src/app/_models';
import { Appointment, AvailableSlot, CreateAppointment } from 'src/app/_models/scheduling';
import { getTypeParameterOwner } from 'typescript';
import { DatabaseService } from '../../database.service';
import { UserService } from '../account/user.service';
import { Create, Get, List, Update } from '../actions';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class AppointmentService implements Create<CreateAppointment, Appointment>, List<Appointment>, Get<Appointment, number> {
  constructor(private api: ApiService, private user: UserService, private db: DatabaseService) { }

  create(object: CreateAppointment): Observable<Appointment> {
    return this.api.post<CreateAppointment, Appointment>('/scheduling/appointment/', object);
  }

  list(): Observable<Appointment[]> {
    return this.api.get<Appointment[]>('/scheduling/appointment/').pipe(
      switchMap((appointments) => {
        return forkJoin(appointments.map(this.transformAppointment.bind(this)));
      })
    );
  }

  read(id: number): Observable<Appointment> {
    return this.api.get<Appointment>(`/scheduling/appointment/${id}/`).pipe(mergeMap(this.transformAppointment.bind(this)));
  }

  private transformAppointment(object: Appointment): Observable<Appointment> {
    const owner = this.user.read(object.owner.toString());
    const invitee = this.user.read(object.invitee.toString());
    const subject = this.db.getSubject(object.subject.toString());
    const startTime = of(parseISO(object.startTime.toString()));
    const duration = of(this.parseDuration(object.duration.toString()));
    return forkJoin(
      {
        owner,
        invitee,
        subject,
        startTime,
        duration
      }).pipe(
      map((values) => {
        return Object.assign(object, values);
      })
    );
  }

  private parseDuration(duration: string): Duration {

    const split = duration.split(':').reverse();
    const result: Duration = {};
    for (let index = 0; index < split.length; index++) {
      const element = split[index];
      switch (index) {
        case 0:
          result.seconds = parseInt(element, 10);  
          break;
        case 1:
          result.minutes = parseInt(element, 10);
          break;
        case 2:
          result.hours = parseInt(element, 10);
          break;
        default:
          break;
      }
    }
    return result;
  }

  accept(id: number): Observable<Appointment> {
    return this.api.post(`/scheduling/appointment/${id}/accept/`, {}).pipe(mergeMap(this.transformAppointment.bind(this)));
  }

  reject(id: number): Observable<Appointment> {
    return this.api.post(`/scheduling/appointment/${id}/reject/`, {}).pipe(mergeMap(this.transformAppointment.bind(this)));
  }

  startMeeting(id: number): Observable<JoinResponse> {
    return this.api.post<any, JoinResponse>(`/scheduling/appointment/${id}/start_meeting/`, {});
  }
}
