import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { AccountComponent } from "./account/account.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";
import { LandingComponent } from "./landing/landing.component";

const routes: Routes = [
  { path: "account", component: AccountComponent },
  { path: "landing", component: LandingComponent },
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
