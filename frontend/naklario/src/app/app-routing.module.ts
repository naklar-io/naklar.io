import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { PageNotFoundComponent } from "./_misc_components/page-not-found/page-not-found.component";
import { LandingComponent } from "./landing/landing.component";
import {
  ImpressumComponent,
  TermsConditionsComponent,
} from "./_misc_components/";
import { AboutComponent } from "./_misc_components/about/about.component";

const routes: Routes = [
  { path: "terms", component: TermsConditionsComponent },
  { path: "imprint", component: ImpressumComponent },
  { path: "privacy", component: ImpressumComponent },
  { path: "about", component: AboutComponent },
  { path: "landing", component: LandingComponent },
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "**", component: PageNotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
