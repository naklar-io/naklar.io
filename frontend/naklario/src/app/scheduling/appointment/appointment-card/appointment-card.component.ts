import { Component, Input, OnInit } from '@angular/core';
import { add } from 'date-fns';
import { Appointment } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'scheduling-appointment-card',
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
})
export class AppointmentCardComponent implements OnInit {
  @Input() appointment: Appointment;
  @Input() onStart: () => void;
  @Input() onAccept: () => void;
  @Input() onReject: () => void;
  // featureEnabled = environment.features.scheduling;
  featureEnabled = true;
  constructor() {
  }

  ngOnInit(): void {

  }

  get endDate(): Date {
    return add(this.appointment.startTime, this.appointment.duration);
  }

}
