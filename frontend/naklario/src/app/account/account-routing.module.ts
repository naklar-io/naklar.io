import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { StudentComponent } from "./student/student.component";
import { TutorComponent } from "./tutor/tutor.component";

const routes: Routes = [
  { path: "account/student", component: StudentComponent },
  { path: 'account/tutor', component: TutorComponent } 
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AccountRoutingModule {}
