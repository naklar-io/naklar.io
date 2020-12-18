import { Component, OnInit } from '@angular/core';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'scheduling-appointment-card',
  templateUrl: './appointment-card.component.html',
  styleUrls: ['./appointment-card.component.scss'],
})
export class AppointmentCardComponent implements OnInit {
  // featureEnabled = environment.features.scheduling;
  featureEnabled = true;
  constructor(private appointments: AppointmentService) {

  }

  ngOnInit(): void {
    this.appointments.list().subscribe(
      x => console.log(x)
    );
  }
}
