import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RouletteComponent } from "./roulette.component";
import { AuthGuard, StudentGuard, TutorGuard } from "../_helpers";

const routes: Routes = [
  {
    path: "roulette/student",
    component: RouletteComponent,
    canActivate: [AuthGuard, StudentGuard],
    children: [],
  },
  {
    path: "roulette/tutor",
    component: RouletteComponent,
    canActivate: [AuthGuard],
    children: [],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouletteRoutingModule {}
