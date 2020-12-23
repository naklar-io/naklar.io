import { Component, OnDestroy, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { add, roundToNearestMinutes, set, setHours } from 'date-fns';
import * as _ from 'lodash';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TimeSlot } from 'src/app/_models/scheduling';
import { TimeslotService } from 'src/app/_services/database/scheduling/timeslot.service';
import { compareAsc } from '../../utils/times';

@Component({
    selector: 'scheduling-timeslot-list',
    templateUrl: './timeslot-list.component.html',
    styleUrls: ['./timeslot-list.component.scss'],
})
export class TimeslotListComponent implements OnInit, OnDestroy {
    @Output() saved;
    timeslotList: TimeSlot[];

    changed: Set<number>;
    private timeslotSub: Subscription;

    constructor(private timeslots: TimeslotService, private activeModal?: NgbActiveModal) {}

    ngOnInit(): void {
        this.timeslotSub = this.timeslots
            .list()
            .pipe(tap((x) => console.log(x)))
            .subscribe((value) => {
                this.timeslotList = value.sort((a, b) => compareAsc(a, b));
            });
        this.timeslotList = [];
        this.changed = new Set<number>();
    }
    ngOnDestroy(): void {
        console.log(this.timeslotList);
        this.timeslotSub.unsubscribe();
    }

    addTimeSlot() {
        let date = roundToNearestMinutes(new Date(), { nearestTo: 30 });
        if (date.getHours() < 8) {
            date = set(date, { hours: 8, minutes: 0 });
        } else if (date.getHours() >= 22) {
            date = add(setHours(date, 8), { days: 1 });
        }
        console.log(date);
        const newTimeslot = new TimeSlot(date, { minutes: 30 }, true);
        const idx = this.timeslotList.push(newTimeslot);
        this.changed.add(idx - 1);
    }

    save() {
        const observables: Observable<TimeSlot>[] = [];
        const observableIdx: number[] = [];
        this.changed.forEach((idx) => {
            const slot = this.timeslotList[idx];

            if (!slot.id) {
                observables.push(this.timeslots.create(slot));
            } else {
                observables.push(this.timeslots.update(slot, slot.id));
            }
            observableIdx.push(idx);
        });
        console.log(observableIdx);
        if (observables.length > 0) {
            forkJoin(observables).subscribe(() => {
                this.changed.clear();

                this.timeslotSub.unsubscribe();
                this.timeslotSub = this.timeslots.list().subscribe((result) => {
                    this.timeslotList = result;
                });
                if (this.activeModal) {
                    this.activeModal.close();
                }
            });
        } else if (this.activeModal) {
            this.activeModal.close();
        }
    }

    deleteTimeSlot(idx: number, slot: TimeSlot) {
        if (!slot.id) {
        } else {
            // delete on server!
            this.timeslots
                .delete(slot.id)
                .subscribe((result) => console.log('got delete result', result));
        }
        this.timeslotList = this.timeslotList.filter((x) => x !== slot);
        this.changed.delete(idx);
    }

    slotChanged(idx: number, slot: TimeSlot) {
        this.timeslotList[idx] = slot;
        this.changed.add(idx);
    }
}
