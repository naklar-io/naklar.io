import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StudentComponent } from "./student/student.component";
import { StudentRegisterComponent } from "./student/student-register/student-register.component";
import { TutorComponent } from "./tutor/tutor.component";
import { TutorRegisterComponent } from "./tutor/tutor-register/tutor-register.component";
import { TermsConditionsComponent } from "../_misc_components/terms-conditions/terms-conditions.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { AuthGuard } from "../_helpers";
import { DatabaseResolverService } from "../_services";
import { VerifyComponent } from "./verify/verify.component";

const routes: Routes = [
  {
    path: "account/verify",
    component: VerifyComponent,
  },
  {
    path: "account/student/register",
    component: StudentRegisterComponent,
    resolve: { constants: DatabaseResolverService },
  },
  { path: "account/student", component: StudentComponent },
  {
    path: "account/tutor/register",
    component: TutorRegisterComponent,
    resolve: { constants: DatabaseResolverService },
  },
  { path: "account/tutor", component: TutorComponent },
  {
    path: "account/login",
    component: LoginComponent,
    resolve: { constants: DatabaseResolverService },
  },
  {
    path: "account",
    component: ProfileComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
