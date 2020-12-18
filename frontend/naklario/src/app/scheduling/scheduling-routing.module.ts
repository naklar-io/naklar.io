import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';


const routes: Routes = [
  {
    path: 'test',
    component: CalendarMultiComponent
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
