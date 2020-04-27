import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StudentComponent } from "./student/student.component";
import { StudentFormComponent } from "./student/student-form/student-form.component";
import { TutorComponent } from "./tutor/tutor.component";
import { TutorFormComponent } from "./tutor/tutor-form/tutor-form.component";
import { LoginComponent } from "./login/login.component";
import { ProfileComponent } from "./profile/profile.component";
import { LoggedInGuard, NotLoggedInGuard } from "../_helpers";
import { DatabaseResolverService, UserResolver } from "../_services";
import { VerifyComponent } from "./verify/verify.component";
import { PasswordResetComponent } from "./password-reset/password-reset.component";
import { ResetRequestComponent } from "./password-reset/reset-request/reset-request.component";
import { RegisterComponent } from './register/register.component';

const routes: Routes = [
  {
    path: "account/verify",
    component: VerifyComponent,
  },
  {
    path: "account/password-reset/:token",
    component: PasswordResetComponent,
  },
  {
    path: "account/password-reset",
    pathMatch: "full",
    component: ResetRequestComponent,
  },
  {
    path: "account/:type/register",
    component: RegisterComponent,
    resolve: { constants: DatabaseResolverService },
    canActivate: [NotLoggedInGuard],
  },
  {
    component: RegisterComponent,
    path: "account/register",
    pathMatch: "full",
  },
  {
    path: "account/login",
    component: LoginComponent,
    resolve: { constants: DatabaseResolverService },
  },
  {
    path: "account",
    component: ProfileComponent,
    resolve: {user: UserResolver, constants: DatabaseResolverService},
    canActivate: [LoggedInGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
