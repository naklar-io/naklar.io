import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RouletteRoutingModule } from './roulette-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { RouletteComponent } from './roulette.component';
import { StudentComponent } from './student/student.component';
import { TutorComponent } from './tutor/tutor.component';
import { Ng5SliderModule } from 'ng5-slider';



@NgModule({
  declarations: [RouletteComponent, StudentComponent, TutorComponent],
  imports: [
    Ng5SliderModule,
    CommonModule,
    ReactiveFormsModule,
    RouletteRoutingModule
  ]
})
export class RouletteModule { }
