import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { AccountComponent } from "./account/account.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";

const routes: Routes = [
  { path: "account", component: AccountComponent },
  { path: "", component: HomeComponent, pathMatch: "full" },
  { path: "**", component: PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
