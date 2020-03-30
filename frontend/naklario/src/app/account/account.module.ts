import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { TutorComponent } from './tutor/tutor.component';
import { StudentComponent } from './student/student.component';


@NgModule({
  declarations: [TutorComponent, StudentComponent],
  imports: [
    CommonModule,
    AccountRoutingModule
  ]
})
export class AccountModule { }
