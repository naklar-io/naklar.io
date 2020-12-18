import { EventEmitter } from '@angular/core';
import { Component, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { add, differenceInMinutes, isAfter, isBefore, sub } from 'date-fns';
import { User } from 'src/app/_models';
import { Appointment } from 'src/app/_models/scheduling';
import { AuthenticationService } from 'src/app/_services';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'scheduling-appointment-card',
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
})
export class AppointmentCardComponent implements OnInit {
  @Input() appointment: Appointment;
  @Output() appointmentChange = new EventEmitter<Appointment>();

  currentUser: User;
  // featureEnabled = environment.features.scheduling;
  featureEnabled = true;
  constructor(
    private auth: AuthenticationService,
    private appointments: AppointmentService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.auth.currentUserValue;
  }

  get endDate(): Date {
    return add(this.appointment.startTime, this.appointment.duration);
  }

  start() {
    this.appointments
      .startMeeting(this.appointment.id)
      .subscribe((response) => {
        console.log('got meeting join response', response);
        const whichUrl = this.currentUser.isStudent ? 'student' : 'tutor';
        this.router.navigate(['roulette', whichUrl], {
          queryParams: { state: 'session', meetingId: response.meetingId },
        });
      });
  }

  accept() {
    this.appointments
      .accept(this.appointment.id)
      .subscribe((value) => this.appointmentChange.emit(value));
  }

  reject() {
    this.appointments
      .reject(this.appointment.id)
      .subscribe((value) => this.appointmentChange.emit(value));
  }

  startTimeInRange() {
    const now = new Date();
    return differenceInMinutes(this.appointment.startTime, now) <= 15;
  }
}
