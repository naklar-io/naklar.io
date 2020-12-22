import { Component, Input, OnInit } from '@angular/core';
import { NgForm } from '@angular/forms';
import { NgbDate } from '@ng-bootstrap/ng-bootstrap';
import { TimeSlot } from 'src/app/_models/scheduling';
import { endTime } from '../../utils/times';

@Component({
  selector: 'scheduling-timeslot-detail',
  templateUrl: './timeslot-detail.component.html',
  styleUrls: ['./timeslot-detail.component.scss']
})
export class TimeslotDetailComponent implements OnInit {

  @Input() slot: TimeSlot;
  date: NgbDate;

  constructor() { }

  ngOnInit(): void {
    this.date = new NgbDate(this.slot.startTime.getFullYear(), this.slot.startTime.getMonth(), this.slot.startTime.getDate());
  }

  get endTime() {
    return endTime(this.slot);
  }

}
