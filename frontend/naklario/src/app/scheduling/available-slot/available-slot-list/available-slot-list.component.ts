import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { add } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject } from 'src/app/_models';
import { Appointment, AvailableSlot, Slot } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { AvailableSlotService } from 'src/app/_services/database/scheduling/available-slot.service';
import { mergeOverlappingSlots } from '../../utils/times';

@Component({
  selector: 'scheduling-available-slot-list',
  templateUrl: './available-slot-list.component.html',
  styleUrls: ['./available-slot-list.component.scss']
})
export class AvailableSlotListComponent implements OnInit {

  availableSlots$: Observable<AvailableSlot[]>;
  @Input() subject: Subject;
  @Output() bookedAppointment = new EventEmitter<Appointment>();
  error = '';

  constructor(private availableSlots: AvailableSlotService, private appointments: AppointmentService) { }

  ngOnInit(): void {
    this.availableSlots$ = this.availableSlots.list(this.subject.id).pipe(map(mergeOverlappingSlots));
  }

  endTime(slot: Slot): Date {
    return add(slot.startTime, slot.duration);
  }

  onBooked(appointment: Appointment) {
    this.bookedAppointment.emit(appointment);
  }

  onError(error) {
    this.error = error;
  }

}
