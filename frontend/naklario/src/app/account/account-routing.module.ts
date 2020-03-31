import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StudentComponent } from "./student/student.component";
import { TutorComponent } from "./tutor/tutor.component";
import { TutorRegisterComponent } from "./tutor/tutor-register/tutor-register.component";
import { FormsModule } from "@angular/forms";

const routes: Routes = [
  { path: "account/student", component: StudentComponent },
  { path: "account/tutor/register", component: TutorRegisterComponent },
  { path: "account/tutor", component: TutorComponent }
];

@NgModule({
  imports: [FormsModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
