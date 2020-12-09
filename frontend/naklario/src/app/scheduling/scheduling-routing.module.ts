import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarSingleComponent } from './calendar-single/calendar-single.component';

const routes: Routes = [
  {
    path: 'test',
    component: CalendarSingleComponent
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
