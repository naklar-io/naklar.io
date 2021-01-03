import { animate, query, stagger, style, transition, trigger } from '@angular/animations';
import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { add } from 'date-fns';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { Subject } from 'src/app/_models';
import { Appointment, AvailableSlot, Slot } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { AvailableSlotService } from 'src/app/_services/database/scheduling/available-slot.service';
import { mergeDaySlots, mergeOverlappingSlots } from '../../utils/times';

@Component({
    selector: 'scheduling-available-slot-list',
    templateUrl: './available-slot-list.component.html',
    styleUrls: ['./available-slot-list.component.scss'],
    animations: [
        trigger('slotTrigger', [
            transition('* => *', [
                query(':enter', [
                    style({ opacity: 0, transform: 'scaleY(0)'}),
                    stagger('10ms', animate('50ms', style({ opacity: 1, transform: 'none'}))),
                ], {optional: true}),
            ]),
        ]),
    ],
})
export class AvailableSlotListComponent implements OnInit, OnDestroy {
    private availableSlots$: Observable<AvailableSlot[]>;
    private availabeSlotsSub: Subscription;
    availableSlotList: AvailableSlot[] = [];
    @Input() subject: Subject;
    @Output() bookedAppointment = new EventEmitter<Appointment>();
    error = '';
    loading = false;

    constructor(
        private availableSlots: AvailableSlotService,
        private appointments: AppointmentService
    ) {}

    ngOnDestroy(): void {
        this.availabeSlotsSub.unsubscribe();
    }

    ngOnInit(): void {
        this.availableSlots$ = this.availableSlots
            .list(this.subject.id)
            .pipe(map(mergeOverlappingSlots), map(mergeDaySlots));
        this.loading = true;
        this.availabeSlotsSub = this.availableSlots$.subscribe((value) => {
            this.availableSlotList = value;
            this.loading = false;
        });
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
