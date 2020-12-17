import { ChangeDetectorRef } from '@angular/core';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  ViewEncapsulation,
  Injectable,
} from '@angular/core';
import {
  CalendarDateFormatter,
  CalendarEvent,
  CalendarEventTimesChangedEvent,
  CalendarEventTitleFormatter,
  CalendarWeekViewBeforeRenderEvent,
} from 'angular-calendar';
import { ViewPeriod, WeekViewHourSegment } from 'calendar-utils';
import {
  add,
  addDays,
  addMinutes,
  compareAsc,
  differenceInDays,
  endOfDay,
  endOfWeek,
  isEqual,
  isSameDay,
  max,
  startOfWeek,
} from 'date-fns';
import { fromEvent } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { colors } from '../utils/colors';
import { RRule } from 'rrule';
import { CustomDateFormatter } from '../utils/custom-date-formatter.provider';

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

interface TimeslotMeta {
  weekly?: boolean;
  id?: number;
  parent: CalendarEvent;
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
  providers: [
    {
      provide: CalendarDateFormatter,
      useClass: CustomDateFormatter,
    },
    {
      provide: CalendarEventTitleFormatter,
      useClass: CustomEventTitleFormatter,
    },
  ],
})
export class CalendarMultiComponent implements OnInit {
  public viewDate: Date = new Date();
  public events: CalendarEvent<TimeslotMeta>[] = [];

  locale = 'de';
  weekStartsOn: 0 = 0;

  clickedDate: Date;

  dragToCreateActive = false;
  // exclude weekends
  excludeDays: number[] = [0, 6];
  viewPeriod: ViewPeriod;

  constructor(private cdr: ChangeDetectorRef) { }

  startDragToCreate(
    segment: WeekViewHourSegment,
    // tslint:disable-next-line: variable-name
    _mouseDownEvent: MouseEvent,
    segmentElement: HTMLElement
  ) {
    const dragToSelectEvent: CalendarEvent = {
      id: this.events.length,
      title: 'Verfügbarkeit',
      start: segment.date,
      end: add(segment.date, { minutes: 30 }),
      color: colors.orange,
      meta: {
        tmpEvent: true,
        weekly: true,
      },
      draggable: true,
      resizable: {
        beforeStart: true, // this allows you to configure the sides the event is resizable from
        afterEnd: true,
      },
      actions: [
        {
          label: '❌',
          onClick: ({ event }: { event: CalendarEvent }): void => {
            this.events = this.events.filter((iEvent) => iEvent !== event);
            console.log('Event deleted', event);
          },
        },
      ],
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
          this.mergeConflictingSlots();
          this.refresh();
        }),
        takeUntil(fromEvent(document, 'mouseup'))
      )
      .subscribe((mouseMoveEvent: MouseEvent) => {
        const minutesDiff = ceilToNearest(
          mouseMoveEvent.clientY - segmentPosition.top,
          30
        );

        const daysDiff = 0;

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

  private mergeConflictingSlots() {
    const events = this.events.sort((eventA, eventB) =>
      compareAsc(eventA.start, eventB.start)
    );
    console.log(events);
    const mergedEvents = [];
    const newEvents = [];
    for (const event of events) {
      if (mergedEvents.includes(event)) {
        continue;
      }
      const conflictingEvents = events.filter(
        (fEvent) =>
          fEvent !== event &&
          fEvent.start.getTime() >= event.start.getTime() &&
          fEvent.start.getTime() <= event.end?.getTime()
      );
      if (conflictingEvents.length > 0) {
        const newEvent = {};
        Object.assign(newEvent, event, {
          end: max([...conflictingEvents.map((ev) => ev.end), event.end]),
        });
        newEvents.push(newEvent);
        mergedEvents.push(...conflictingEvents);
      } else {
        newEvents.push(event);
      }
    }
    const difference = this.events.filter((x) => !newEvents.includes(x));
    if (difference.length > 0) {
      this.events = newEvents;
      this.mergeConflictingSlots();
    } else {
      this.events = newEvents;
    }
  }

  updateCalendarEvents(viewRender: CalendarWeekViewBeforeRenderEvent): void {
    if (
      !this.viewPeriod ||
      !isEqual(this.viewPeriod.start, viewRender.period.start) ||
      !isEqual(this.viewPeriod.end, viewRender.period.end)
    ) {
      this.viewPeriod = viewRender.period;
      this.addWeeklyEvents();
    }
  }

  addWeeklyEvents() {
    const weeklyEvents = this.events.filter((ev) => ev?.meta?.weekly);
    const realNonWeeklyEvents = this.events.filter(
      (ev) => ev?.meta?.parent === null && !ev?.meta?.weekly
    );
    let result = [];
    for (const event of weeklyEvents) {
      const rrule = new RRule({
        freq: RRule.WEEKLY,
        interval: 1,
        dtstart: event.start,
        until: endOfDay(this.viewPeriod.end),
      });
      rrule.all().forEach((date) => {
        const newEvent = {};
        Object.assign(newEvent, event, {
          start: date,
          end: add(event.end, { days: -differenceInDays(event.start, date) }),
          meta: {
            weekly: true,
            parent: isSameDay(date, event.start) ? null : event,
            id: event.meta.id,
          },
        });
        result.push(newEvent);
      });
    }
    result = result.filter((ev) =>
      isEqual(startOfWeek(this.viewPeriod.start), startOfWeek(ev.start))
    );
    console.log(result);
    result.push(...realNonWeeklyEvents);
    this.events = result;
    this.cdr.detectChanges();
  }

  eventTimesChanged({
    event,
    newStart,
    newEnd,
  }: CalendarEventTimesChangedEvent): void {
    if (isSameDay(event.start, newStart)) {
      event.start = newStart;
    }
    if (isSameDay(event.end, newEnd)) {
      event.end = newEnd;
    }
    console.log('evtimeschagned');
    this.mergeConflictingSlots();
    this.refresh();
  }

  ngOnInit(): void { }
}
