import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { TutorComponent } from './tutor/tutor.component';
import { StudentComponent } from './student/student.component';
import { TutorRegisterComponent } from './tutor/tutor-register/tutor-register.component';


@NgModule({
  declarations: [TutorComponent, StudentComponent, TutorRegisterComponent],
  imports: [
    CommonModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
