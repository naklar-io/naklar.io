import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { Appointment } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';

@Component({
    selector: 'scheduling-appointment-answer',
    templateUrl: './appointment-answer.component.html',
    styleUrls: ['./appointment-answer.component.scss'],
})
export class AppointmentAnswerComponent implements OnInit {
    appointment$: Observable<Appointment>;
    refreshSub = new BehaviorSubject(null);
    error: any = null;

    constructor(private appointments: AppointmentService, private route: ActivatedRoute, private router: Router) {}

    ngOnInit(): void {
        this.appointment$ = combineLatest([this.route.params, this.refreshSub]).pipe(
            switchMap(([params, _]) => {
                return this.appointments.read(parseInt(params.id, 10));
            }),
            catchError((err) => {
                this.error = err;
                console.log(err);
                return throwError(err);
            })
        );
    }

    refresh(value): void {
        if (value === null) {
            this.appointment$ = of(null);
            this.router.navigateByUrl('/dashboard');
        } else {
            this.refreshSub.next(null);
        }
        
    }
}
