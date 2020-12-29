import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AccountRoutingModule } from './account-routing.module';
import { TutorComponent } from './tutor/tutor.component';
import { StudentComponent } from './student/student.component';
import { TutorFormComponent } from './tutor/tutor-form/tutor-form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { StudentFormComponent } from './student/student-form/student-form.component';
import { LoginComponent } from './login/login.component';
import { ProfileComponent } from './profile/profile.component';
import { DatabaseService, AuthenticationService } from '../_services';

import { VerifyComponent } from './verify/verify.component';

import { PasswordResetComponent } from './password-reset/password-reset.component';
import { ResetRequestComponent } from './password-reset/reset-request/reset-request.component';
import { MiscComponentsModule } from '../_misc_components/misc-components.module';
import { RegisterComponent } from './register/register.component';
import { NgxSliderModule } from '@angular-slider/ngx-slider';
import { TutorRegisterComponent } from './tutor-register/tutor-register.component';

import { MatStepperModule } from '@angular/material/stepper';
import { AccessCodeComponent } from './access-code/access-code.component';
import { NgbAlert, NgbModal, NgbModule } from '@ng-bootstrap/ng-bootstrap';
@NgModule({
  declarations: [
    TutorComponent,
    StudentComponent,
    TutorFormComponent,
    StudentFormComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    VerifyComponent,
    PasswordResetComponent,
    ResetRequestComponent,
    TutorRegisterComponent,
    AccessCodeComponent,
  ],
  imports: [
    MiscComponentsModule,
    NgxSliderModule,
    FormsModule,
    MatStepperModule,
    ReactiveFormsModule,
    CommonModule,
    AccountRoutingModule,
    NgbModule
  ],
  exports: [
    AccessCodeComponent,
  ],
  providers: [DatabaseService, AuthenticationService],
})
export class AccountModule { }
