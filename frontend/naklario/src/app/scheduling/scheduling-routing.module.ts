import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';
import { MeetingCardComponent } from './meeting-card/meeting-card.component';

const routes: Routes = [
  {
    path: 'test',
    component: CalendarMultiComponent
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
