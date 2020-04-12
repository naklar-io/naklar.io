import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AccountRoutingModule } from "./account-routing.module";
import { TutorComponent } from "./tutor/tutor.component";
import { StudentComponent } from "./student/student.component";
import { TutorRegisterComponent } from "./tutor/tutor-register/tutor-register.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { Ng5SliderModule } from "ng5-slider";
import { StudentRegisterComponent } from "./student/student-register/student-register.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { DatabaseService, AuthenticationService } from "../_services";

import {
  TermsConditionsComponent,
  ImgUploadComponent,
} from "../_misc_components";
import { VerifyComponent } from "./verify/verify.component";

import { NgSelectModule } from "@ng-select/ng-select";
@NgModule({
  declarations: [
    TutorComponent,
    StudentComponent,
    TutorRegisterComponent,
    ImgUploadComponent,
    StudentRegisterComponent,
    TermsConditionsComponent,
    LoginComponent,
    ProfileComponent,
    VerifyComponent,
  ],
  imports: [
    Ng5SliderModule,
    NgSelectModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    AccountRoutingModule,
  ],
  providers: [DatabaseService, AuthenticationService],
})
export class AccountModule {}
