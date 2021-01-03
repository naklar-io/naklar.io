import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { add, formatISO, isEqual } from 'date-fns';
import { Observable } from 'rxjs';
import { first } from 'rxjs/operators';
import { Subject } from 'src/app/_models';
import {
    Appointment,
    AvailableSlot,
    CreateAppointment,
    MergedSlot,
    Slot,
} from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { endTime, getStartTimes } from '../../utils/times';

@Component({
    selector: 'scheduling-available-slot-detail',
    templateUrl: './available-slot-detail.component.html',
    styleUrls: ['./available-slot-detail.component.scss'],
})
export class AvailableSlotDetailComponent implements OnInit {
    @Input() slot: MergedSlot<AvailableSlot>;
    @Input() subject: Subject = new Subject(1, 'deutsch');
    @Output() bookedAppointment = new EventEmitter<Appointment>();
    @Output() bookingError = new EventEmitter<string>();

    isCollapsed = true;
    topic = '';
    selectedDate = null;
    selectedDuration = null;

    constructor(private appointments: AppointmentService, private modalService: NgbModal) {}

    ngOnInit(): void {}

    endTime(slot: Slot) {
        return endTime(slot);
    }

    get startTimes(): Date[] {
        const result = [];
        const allTimes = this.slot.children.map(getStartTimes);
        allTimes.forEach((x) => {
            x.forEach((time) => {
                const isInArray = result.find((resultTime) => isEqual(resultTime, time));
                if (!isInArray) {
                    result.push(time);
                }
            });
        });
        return result;
    }

    bookTime(date: Date, content) {
        this.selectedDate = date;
        this.selectedDuration = { minutes: 30 };
        const modal = this.modalService.open(content, {
          centered: true
        });
        modal.dismissed.pipe(first()).subscribe((_) => console.log('modal dismissed!'));
        modal.closed.pipe(first()).subscribe((_) => {
            const newAppointment = new CreateAppointment(
                date,
                { minutes: 30 },
                this.subject,
                this.topic
            );
            this.appointments.create(newAppointment).subscribe(
                (result) => {
                    this.bookedAppointment.emit(result);
                },
                (error) => {
                    this.bookingError.emit(error);
                }
            );
        });
    }

    calculateEnd(date, duration) {
        return add(date, duration);
    }
}
