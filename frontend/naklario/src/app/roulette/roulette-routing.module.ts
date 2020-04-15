import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RouletteComponent } from "./roulette.component";
import { LoggedInGuard, StudentGuard, TutorGuard } from "../_helpers";
import { DatabaseResolverService, UserResolver } from "../_services";

const routes: Routes = [
  {
    path: "roulette",
    children: [
      {
        path: "student",
        component: RouletteComponent,
        canActivate: [StudentGuard],
        children: [],
      },
      {
        path: "tutor",
        component: RouletteComponent,
        canActivate: [TutorGuard],
        children: [],
      },
    ],
    resolve: { constants: DatabaseResolverService, user: UserResolver },
    canActivate: [LoggedInGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RouletteRoutingModule {}
