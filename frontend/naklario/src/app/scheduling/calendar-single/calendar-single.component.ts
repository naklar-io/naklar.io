import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CalendarEvent, CalendarView } from 'angular-calendar';

@Component({
  selector: 'scheduling-calendar-single',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-single.component.html',
  styleUrls: ['./calendar-single.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarSingleComponent implements OnInit {

  public viewDate: Date = new Date();
  public events: CalendarEvent[] = [];

  constructor() { }


  ngOnInit(): void {
  }

}
