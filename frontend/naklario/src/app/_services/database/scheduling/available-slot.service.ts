import { HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { parseISO } from 'date-fns';
import { forkJoin, Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Subject } from 'src/app/_models';
import { AvailableSlot } from 'src/app/_models/scheduling';
import { UserService } from '../account/user.service';
import { ApiService } from '../api.service';
import { deserializeDuration } from './utils';

const BASE_URL = '/scheduling/available-slot/';
@Injectable({
  providedIn: 'root',
})
export class AvailableSlotService {
  constructor(private api: ApiService, private users: UserService) {}

  list(subjectId: number): Observable<AvailableSlot[]> {
    return this.api
      .get<AvailableSlot[]>(
        `${BASE_URL}?`,
        new HttpParams().set('subject', subjectId.toString(10))
      )
      .pipe(
        switchMap((appointments) => {
          if (appointments.length > 0) {
            return forkJoin(appointments.map(this.transformAvailableSlot.bind(this)));
          }
          return [appointments];
        })
      );
  }

  subjects(): Observable<Subject[]> {
    return this.api.get<Subject[]>(`${BASE_URL}subjects/`);
  }


  private transformAvailableSlot(
    object: AvailableSlot
  ): Observable<AvailableSlot> {
    const owner = this.users.read(object.owner.toString());
    const startTime = of(parseISO(object.startTime.toString()));
    const duration = of(deserializeDuration(object.duration.toString()));
    return forkJoin({
      owner,
      startTime,
      duration,
    }).pipe(
      map((values) => {
        return Object.assign(object, values);
      })
    );
  }
}
