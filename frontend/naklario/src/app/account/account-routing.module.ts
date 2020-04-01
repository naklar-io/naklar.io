import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StudentComponent } from "./student/student.component";
import { StudentRegisterComponent } from "./student/student-register/student-register.component";
import { TutorComponent } from "./tutor/tutor.component";
import { TutorRegisterComponent } from "./tutor/tutor-register/tutor-register.component";
import { TermsConditionsComponent } from "./tutor/terms-conditions/terms-conditions.component";

const routes: Routes = [
  { path: "account/student/register", component: StudentRegisterComponent },
  { path: "account/student", component: StudentComponent },
  { path: "account/terms", component: TermsConditionsComponent },
  { path: "account/tutor/register", component: TutorRegisterComponent },
  { path: "account/tutor", component: TutorComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
