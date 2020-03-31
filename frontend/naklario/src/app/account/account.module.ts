import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { TutorComponent } from './tutor/tutor.component';
import { StudentComponent } from './student/student.component';
import { TutorRegisterComponent } from './tutor/tutor-register/tutor-register.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [TutorComponent, StudentComponent, TutorRegisterComponent],
  imports: [
    FormsModule,
    CommonModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
