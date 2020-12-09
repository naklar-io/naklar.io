import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, CalendarWeekViewComponent, DateAdapter } from 'angular-calendar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';


@NgModule({
  declarations: [
    CalendarSingleComponent,
    CalendarMultiComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    SchedulingRoutingModule
  ],
  exports: [
    CalendarSingleComponent
  ]
})
export class SchedulingModule { }
