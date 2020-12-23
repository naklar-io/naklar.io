import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';

import { SchedulingRoutingModule } from './scheduling-routing.module';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';
import { AppointmentCardComponent } from './appointment/appointment-card/appointment-card.component';
import { AppointmentListComponent } from './appointment/appointment-list/appointment-list.component';
import { AvailableSlotListComponent } from './available-slot/available-slot-list/available-slot-list.component';
import { AvailableSlotDetailComponent } from './available-slot/available-slot-detail/available-slot-detail.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AppointmentAnswerComponent } from './appointment/appointment-answer/appointment-answer.component';
import { TimeslotListComponent } from './timeslot/timeslot-list/timeslot-list.component';
import { TimeslotDetailComponent } from './timeslot/timeslot-detail/timeslot-detail.component';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SharedModule } from '../@shared/shared.module';

registerLocaleData(localeDe);

@NgModule({
    declarations: [
        CalendarSingleComponent,
        CalendarMultiComponent,
        AppointmentCardComponent,
        AppointmentListComponent,
        AvailableSlotListComponent,
        AvailableSlotDetailComponent,
        AppointmentAnswerComponent,
        TimeslotDetailComponent,
        TimeslotListComponent,
    ],
    imports: [
        SharedModule,
        CommonModule,
        BrowserAnimationsModule,
        NgbModule,
        FormsModule,
        FontAwesomeModule,
        CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
        SchedulingRoutingModule,
    ],
    exports: [
        CalendarSingleComponent,
        AppointmentCardComponent,
        AppointmentListComponent,
        AvailableSlotListComponent,
    ],
})
export class SchedulingModule {}
