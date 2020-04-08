import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";
import { LandingComponent } from "./landing/landing.component";
import { ImpressumComponent } from "./impressum/impressum.component";
import { AboutComponent } from "./about/about.component";

const routes: Routes = [
  { path: "landing", component: LandingComponent },
  { path: "impressum", component: ImpressumComponent },
  { path: "about", component: AboutComponent },
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
