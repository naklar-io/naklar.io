import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { add } from 'date-fns';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Appointment, AvailableSlot, Slot, TimeSlot } from 'src/app/_models/scheduling';
import { DatabaseService } from 'src/app/_services';
import { AvailableSlotService } from 'src/app/_services/database/scheduling/available-slot.service';
import { mergeOverlappingSlots } from '../../utils/times';

@Component({
  selector: 'scheduling-available-slot-list',
  templateUrl: './available-slot-list.component.html',
  styleUrls: ['./available-slot-list.component.scss']
})
export class AvailableSlotListComponent implements OnInit {

  availableSlots$: Observable<AvailableSlot[]>;
  @Input() subjectId = 1;
  @Output() bookedAppointment = new EventEmitter<Appointment>();

  constructor(private availableSlots: AvailableSlotService) { }

  ngOnInit(): void {
    
    this.availableSlots$ = this.availableSlots.list(this.subjectId).pipe(map(mergeOverlappingSlots));
  }

  endTime(slot: Slot): Date {
    return add(slot.startTime, slot.duration);
  }

  onBooked(appointment: Appointment) {
    this.bookedAppointment.emit(appointment);
  }

}
