import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AvailableSlotListComponent } from './available-slot/available-slot-list/available-slot-list.component';
import { CalendarMultiComponent } from './calendar-multi/calendar-multi.component';


const routes: Routes = [
  {
    path: 'test',
    component: CalendarMultiComponent
  },
  {
    path: 'test2',
    component: AvailableSlotListComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SchedulingRoutingModule { }
