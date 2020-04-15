import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { UserResolver } from './_services';

import { AboutComponent } from "./home/misc/about/about.component";
import { FeedbackComponent } from "./home/misc/feedback/feedback.component";
import { HelpSupportComponent } from "./home/misc/help-support/help-support.component";
import { ImpressumComponent } from "./home/misc/impressum/impressum.component";
import { ParentsComponent } from "./home/misc/parents/parents.component";
import { SchoolsComponent } from "./home/misc/schools/schools.component";
import { StudentsComponent } from "./home/misc/students/students.component";
import { TutorsComponent } from "./home/misc/tutors/tutors.component";
import { TermsConditionsComponent } from "./home/misc/terms-conditions/terms-conditions.component";
import { PageNotFoundComponent } from "./home/misc/page-not-found/page-not-found.component";


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
