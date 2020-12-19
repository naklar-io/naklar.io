import { Component, Input, OnInit } from '@angular/core';
import { formatISO } from 'date-fns';
import { Subject } from 'src/app/_models';
import { AvailableSlot, CreateAppointment, MergedSlot, Slot } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { endTime, getStartTimes } from '../../utils/times';

@Component({
  selector: 'scheduling-available-slot-detail',
  templateUrl: './available-slot-detail.component.html',
  styleUrls: ['./available-slot-detail.component.scss']
})
export class AvailableSlotDetailComponent implements OnInit {

  @Input() slot: MergedSlot<AvailableSlot>;
  @Input() subject: Subject = new Subject(1, 'deutsch');
  isCollapsed = true;
  topic = '';

  constructor(private appointments: AppointmentService) { }

  ngOnInit(): void {
  }

  endTime(slot: Slot) {
    return endTime(slot);
  }

  get startTimes(): Date[] {
    return [...new Set(...this.slot.children.map(getStartTimes))];
  }

  bookTime(date: Date) {
    const newAppointment = new CreateAppointment(date, {minutes: 30}, this.subject, this.topic);
    this.appointments.create(newAppointment).subscribe((result) => {
      console.log(result);
    });
  }

}
