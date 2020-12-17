import { ChangeDetectorRef } from "@angular/core";
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  Injectable
} from "@angular/core";
import { CalendarEvent, CalendarEventTitleFormatter, CalendarWeekViewBeforeRenderEvent } from "angular-calendar";
import { addDays, addMinutes, endOfWeek } from "date-fns";

function floorToNearest(amount: number, precision: number) {
  return Math.floor(amount / precision) * precision;
}

function ceilToNearest(amount: number, precision: number) {
  return Math.ceil(amount / precision) * precision;
}

@Injectable()
export class CustomEventTitleFormatter extends CalendarEventTitleFormatter {
  weekTooltip(event: CalendarEvent, title: string) {
    if (!event.meta.tmpEvent) {
      return super.weekTooltip(event, title);
    }
  }

  dayTooltip(event: CalendarEvent, title: string) {
    if (!event.meta.tmpEvent) {
      return super.dayTooltip(event, title);
    }
  }
}

@Component({
  selector: 'scheduling-calendar-multi',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './calendar-multi.component.html',
  styles: [
    `
      .disable-hover {
        pointer-events: none;
      }
    `,
  ],
  styleUrls: ['./calendar-multi.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CalendarMultiComponent implements OnInit {
  public viewDate: Date = new Date();
  public events: CalendarEvent[] = [
  ];
  locale: string = 'de';
  weekStartsOn: number = 1;

  clickedDate: Date;

  dragToCreateActive = false;

  constructor(private cdr: ChangeDetectorRef) {}

  startDragToCreate(
    segment: WeekViewHourSegment,
    mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    const dragToSelectEvent: CalendarEvent = {
      id: this.events.length,
      title: 'New event',
      start: segment.date,
      meta: {
        tmpEvent: true,
      },
    };
    this.events = [...this.events, dragToSelectEvent];
    const segmentPosition = segmentElement.getBoundingClientRect();
    this.dragToCreateActive = true;
    const endOfView = endOfWeek(this.viewDate, {
      weekStartsOn: this.weekStartsOn,
    });

    fromEvent(document, 'mousemove')
      .pipe(
        finalize(() => {
          delete dragToSelectEvent.meta.tmpEvent;
          this.dragToCreateActive = false;
          this.refresh();
        }),
        takeUntil(fromEvent(document, 'mouseup'))
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        const minutesDiff = ceilToNearest(
          mouseMoveEvent.clientY - segmentPosition.top,
          30
        );

        const daysDiff =
          floorToNearest(
            mouseMoveEvent.clientX - segmentPosition.left,
            segmentPosition.width
          ) / segmentPosition.width;

        const newEnd = addDays(addMinutes(segment.date, minutesDiff), daysDiff);
        if (newEnd > segment.date && newEnd < endOfView) {
          dragToSelectEvent.end = newEnd;
        }
        this.refresh();
      });
  }

  private refresh() {
    this.events = [...this.events];
    this.cdr.detectChanges();
  }

  ngOnInit(): void {
  }

}
