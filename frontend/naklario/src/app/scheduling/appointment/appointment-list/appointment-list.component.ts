import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { Appointment } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';

@Component({
  selector: 'scheduling-appointment-list',
  templateUrl: './appointment-list.component.html',
  styleUrls: ['./appointment-list.component.scss']
})
export class AppointmentListComponent implements OnInit {

  appointments$: Observable<Appointment[]>;

  constructor(private appointments: AppointmentService) { }

  ngOnInit(): void {
    this.appointments$ = this.appointments.list();
  }

}
