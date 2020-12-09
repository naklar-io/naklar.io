import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarWeekModule } from 'angular-calendar';


@NgModule({
  declarations: [
    CalendarWeekModule,CalendarSingleComponent],
  imports: [
    CommonModule,
    SchedulingRoutingModule
  ]
})
export class SchedulingModule { }
