import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';
import { MeetingCardComponent } from './meeting-card/meeting-card.component';

registerLocaleData(localeDe);

@NgModule({
  declarations: [
    CalendarSingleComponent,
    CalendarMultiComponent,
    MeetingCardComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    SchedulingRoutingModule
  ],
  exports: [
    CalendarSingleComponent,
    MeetingCardComponent
  ]
})
export class SchedulingModule { }
