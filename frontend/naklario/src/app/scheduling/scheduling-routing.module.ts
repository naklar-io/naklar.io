import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoggedInGuard } from '../_helpers';
import { AppointmentAnswerComponent } from './appointment/appointment-answer/appointment-answer.component';
import { AvailableSlotListComponent } from './available-slot/available-slot-list/available-slot-list.component';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';
import { TimeslotListComponent } from './timeslot/timeslot-list/timeslot-list.component';


const routes: Routes = [
  {
    path: 'test',
    component: CalendarMultiComponent
  },
  {
    path: 'test2',
    component: TimeslotListComponent,
  },
  {
    path: 'scheduling/appointment/:id/answer',
    component: AppointmentAnswerComponent,
    canActivate: [LoggedInGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
