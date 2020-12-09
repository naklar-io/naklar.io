import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import {
  CalendarEvent,
  CalendarView,
  CalendarWeekViewBeforeRenderEvent,
} from "angular-calendar";

@Component({
  selector: "scheduling-calendar-single",
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./calendar-single.component.html",
  styleUrls: ["./calendar-single.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarSingleComponent implements OnInit {
  public viewDate: Date = new Date();
  public events: CalendarEvent[] = [];

  clickedDate: Date;

  //Hier wird gerendert welche Slots verfügbar sind und welche nicht
  beforeWeekViewRender(renderEvent: CalendarWeekViewBeforeRenderEvent) {
    renderEvent.hourColumns.forEach((hourColumn) => {
      hourColumn.hours.forEach((hour) => {
        hour.segments.forEach((segment) => {
          if (
            ((segment.date.getHours() >= 14 || segment.date.getHours() <= 10) &&
              segment.date.getDay() === 2) ||
            segment.date.getDay() != 2
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
