import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { PageNotFoundComponent } from "./_misc_components/page-not-found/page-not-found.component";
import { LandingComponent } from "./landing/landing.component";
import {
  ImpressumComponent,
  TermsConditionsComponent,
  FeedbackComponent,
  AboutComponent,
  HelpSupportComponent,
  ParentsComponent,
  SchoolsComponent,
  StudentsComponent,
  TutorsComponent,
} from "./_misc_components/";
import { UserResolver } from './_services';

const routes: Routes = [
  {
    path: "",
    children: [
      { path: "feedback", component: FeedbackComponent },
      { path: "support", component: HelpSupportComponent },
      { path: "parents", component: ParentsComponent },
      { path: "schools", component: SchoolsComponent },
      { path: "students", component: StudentsComponent },
      { path: "tutors", component: TutorsComponent },
      { path: "terms", component: TermsConditionsComponent },
      { path: "imprint", component: ImpressumComponent },
      { path: "privacy", component: ImpressumComponent },
      { path: "about", component: AboutComponent },
      { path: "landing", component: LandingComponent },
      { path: "", component: HomeComponent, pathMatch: "full" },
      { path: "**", component: PageNotFoundComponent },
    ],
    resolve: {"user": UserResolver}
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { scrollPositionRestoration: "enabled" }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
