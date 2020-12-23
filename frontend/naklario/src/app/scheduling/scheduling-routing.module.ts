import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoggedInGuard } from '../_helpers';
import { AppointmentAnswerComponent } from './appointment/appointment-answer/appointment-answer.component';
import { TimeslotListComponent } from './timeslot/timeslot-list/timeslot-list.component';


const routes: Routes = [
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
