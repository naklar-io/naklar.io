import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { DateAdapter } from '@angular/material/core';
import {
  CalendarEvent,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent,
  DAYS_OF_WEEK,
} from "angular-calendar";
import { addDays, addHours, startOfDay } from 'date-fns';
import { CalendarWeekViewHourSegmentComponent } from 'angular-calendar/modules/week/calendar-week-view-hour-segment.component';

@Component({
  selector: "scheduling-calendar-single",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./calendar-single.component.html",
  styleUrls: ["./calendar-single.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarSingleComponent implements OnInit {
  public viewDate: Date = new Date();
  public events: CalendarEvent[] = [
  ];
  locale: string = 'de';
  weekStartsOn: number = this.viewDate.getDay();

  clickedDate: Date;

  //Hier wird gerendert welche Slots verfügbar sind und welche nicht
  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (
            ((segment.date.getHours() >= 14 || segment.date.getHours() <= 10) &&
              segment.date.getDay() === 2) ||
            segment.date.getDay() <= 2
          ) {
            segment.cssClass = "bg-disabled";
          }
        });
      });
    });
  }

  constructor() {}

  ngOnInit(): void {}
}
