import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { TimeSlot } from 'src/app/_models/scheduling';
import { TimeslotService } from 'src/app/_services/database/scheduling/timeslot.service';

@Component({
  selector: 'scheduling-timeslot-list',
  templateUrl: './timeslot-list.component.html',
  styleUrls: ['./timeslot-list.component.scss']
})
export class TimeslotListComponent implements OnInit {

  timeslots$: Observable<TimeSlot[]>;

  constructor(private timeslots: TimeslotService) { }

  ngOnInit(): void {
    this.timeslots$ = this.timeslots.list().pipe(tap((x) => console.log(x)));
  }

}
