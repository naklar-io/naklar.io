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
import { AppointmentCardComponent } from './appointment/appointment-card/appointment-card.component';
import { AppointmentListComponent } from './appointment/appointment-list/appointment-list.component';
import { AvailableSlotListComponent } from './available-slot/available-slot-list/available-slot-list.component';
import { AvailableSlotDetailComponent } from './available-slot/available-slot-detail/available-slot-detail.component';
import { NgbCollapse, NgbModule } from '@ng-bootstrap/ng-bootstrap';

registerLocaleData(localeDe);

@NgModule({
  declarations: [
    CalendarSingleComponent,
    CalendarMultiComponent,
    AppointmentCardComponent,
    AppointmentListComponent,
    AvailableSlotListComponent,
    AvailableSlotDetailComponent
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    NgbModule,
    CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
    SchedulingRoutingModule
  ],
  exports: [
    CalendarSingleComponent,
    AppointmentCardComponent,
    AppointmentListComponent,
    AvailableSlotListComponent
  ]
})
export class SchedulingModule { }
