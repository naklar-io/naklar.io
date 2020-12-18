import { Component, OnInit } from '@angular/core';
import { add, compareAsc, isAfter } from 'date-fns';
import { BehaviorSubject, combineLatest, interval, Observable } from 'rxjs';
import { filter, map, startWith, switchMap } from 'rxjs/operators';
import { Appointment } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';

@Component({
  selector: 'scheduling-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss'],
})
export class AppointmentListComponent implements OnInit {
  refresh$ = new BehaviorSubject(null);
  autoRefresh$ = interval(1000 * 30).pipe(startWith(0));
  appointments$: Observable<Appointment[]>;

  constructor(private appointments: AppointmentService) {}

  ngOnInit(): void {
    this.appointments$ = combineLatest([this.refresh$, this.autoRefresh$]).pipe(
      switchMap(() =>
        this.appointments
          .list()
          .pipe(
            map((appointments) =>
              appointments
                .sort((a, b) => compareAsc(a.startTime, b.startTime))
                .filter((ap) =>
                  isAfter(add(ap.startTime, ap.duration), new Date())
                )
            )
          )
      )
    );
  }
  refresh() {
    this.refresh$.next(null);
  }
}
