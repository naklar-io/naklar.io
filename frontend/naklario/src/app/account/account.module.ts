import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { TutorComponent } from './tutor/tutor.component';
import { StudentComponent } from './student/student.component';
import { TutorRegisterComponent } from './tutor/tutor-register/tutor-register.component';
import { FormsModule } from '@angular/forms';

import {Ng5SliderModule} from 'ng5-slider'


@NgModule({
  declarations: [TutorComponent, StudentComponent, TutorRegisterComponent],
  imports: [
    Ng5SliderModule,
    FormsModule,
    CommonModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
