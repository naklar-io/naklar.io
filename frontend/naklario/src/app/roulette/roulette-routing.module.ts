import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { RouletteComponent } from "./roulette.component";

const routes: Routes = [
  { path: "roulette/:type", component: RouletteComponent }

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RouletteRoutingModule {}
