import { Component, EventEmitter, Injectable, Input, OnInit, Output } from '@angular/core';
import { NgbDate, NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import {
    add,
    getDate,
    getMonth,
    getYear,
    intervalToDuration,
    set,
    setHours,
    setMinutes,
} from 'date-fns';
import { TimeSlot } from 'src/app/_models/scheduling';
import { endTime } from '../../utils/times';

/**
 * This Service handles how the date is rendered and parsed from keyboard i.e. in the bound input field.
 */
@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {
    readonly DELIMITER = '.';

    parse(value: string): NgbDateStruct | null {
        if (value) {
            const date = value.split(this.DELIMITER);
            return {
                day: parseInt(date[0], 10),
                month: parseInt(date[1], 10),
                year: parseInt(date[2], 10),
            };
        }
        return null;
    }

    format(date: NgbDateStruct | null): string {
        return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
    }
}

interface SimpleTime {
    id: number;
    hour: number;
    minute: number;
}
@Component({
    selector: 'scheduling-timeslot-detail',
    templateUrl: './timeslot-detail.component.html',
    styleUrls: ['./timeslot-detail.component.scss'],
    providers: [{ provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter }],
})
export class TimeslotDetailComponent implements OnInit {
    @Input() slot: TimeSlot;
    @Input() index = 0;
    @Input() otherSlots: TimeSlot[] = [];
    @Output() delete = new EventEmitter<TimeSlot>();

    date: NgbDate;
    public startTime: number = null;
    public endTime: number = null;
    selectOptions: SimpleTime[];

    constructor() {}

    ngOnInit(): void {
        const month = getMonth(this.slot.startTime) + 1;
        this.date = new NgbDate(getYear(this.slot.startTime), month, getDate(this.slot.startTime));
        this.selectOptions = this.generateSelectOptions();
        this.startTime = this.selectOptions.find(
            (time) =>
                time.hour === this.slot.startTime.getHours() &&
                time.minute === this.slot.startTime.getMinutes()
        ).id;

        const end = endTime(this.slot);
        this.endTime = this.selectOptions.find(
            (time) => time.hour === end.getHours() && time.minute === end.getMinutes()
        ).id;
        console.log(this.startTime, this.endTime);
    }

    private generateSelectOptions() {
        let time = { hour: 8, minute: 0 };
        const times = [];
        let counter = 0;
        while (time.hour < 22) {
            times.push(time);
            const newTime = { id: counter++, hour: time.hour, minute: time.minute };
            newTime.minute += 30;
            if (Math.floor(newTime.minute / 60) > 0) {
                newTime.hour += 1;
                newTime.minute = newTime.minute % 60;
            }
            time = newTime;
        }
        return times;
    }

    private getTimeById(id: number) {
        return this.selectOptions.find((val) => val.id === id);
    }

    startTimeChange() {
        const selectedStartTime = this.getTimeById(parseInt(this.startTime as any, 10));
        let selectedEndTime = this.getTimeById(parseInt(this.endTime as any, 10));
        if (selectedStartTime.id > selectedEndTime.id) {
            selectedEndTime = this.getTimeById(selectedStartTime.id + 1);
        }
        this.startTime = selectedStartTime.id;
        this.endTime = selectedEndTime.id;
        this.updateTimes(selectedStartTime, selectedEndTime);
    }

    endTimeChange() {
        let selectedStartTime = this.getTimeById(parseInt(this.startTime as any, 10));
        const selectedEndTime = this.getTimeById(parseInt(this.endTime as any, 10));
        if (selectedStartTime.id > selectedEndTime.id) {
            selectedStartTime = this.getTimeById(selectedStartTime.id - 1);
        }
        this.startTime = selectedStartTime.id;
        this.endTime = selectedEndTime.id;
        this.updateTimes(selectedStartTime, selectedEndTime);
    }

    updateTimes(startTime?: SimpleTime, selectedEndTime?: SimpleTime) {
        this.slot.startTime = set(this.slot.startTime, {
            year: this.date.year,
            month: this.date.month - 1,
            date: this.date.day,
        });
        if (startTime) {
            this.slot.startTime = setMinutes(
                setHours(this.slot.startTime, startTime.hour),
                startTime.minute
            );
        }
        let slotEnd = this.getSlotEndTime();
        if (selectedEndTime) {
            slotEnd = setMinutes(
                setHours(add(this.slot.startTime, this.slot.duration), selectedEndTime.hour),
                selectedEndTime.minute
            );
        }
        this.slot.duration = intervalToDuration({ start: this.slot.startTime, end: slotEnd });
    }

    getSlotEndTime() {
        return endTime(this.slot);
    }

    onDelete() {
        this.delete.emit(this.slot);
    }
}
