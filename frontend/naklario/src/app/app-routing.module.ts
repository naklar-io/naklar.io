import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";

import { HomeComponent } from "./home/home.component";
import {
  UserResolver,
  DatabaseResolverService,
} from "./_services";

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
import { DashboardComponent } from "./dashboard/dashboard.component";
import { LoggedInGuard } from "./_helpers";
import { PrivacyComponent } from "./home/misc/privacy/privacy.component";
import { PressComponent } from './home/misc/press/press.component'

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "dashboard",
        component: DashboardComponent,
        canActivate: [LoggedInGuard],
        resolve: {
          constants: DatabaseResolverService,
          user: UserResolver,
        },
      },
      { path: "feedback", component: FeedbackComponent },
      { path: "support", component: HelpSupportComponent },
      { path: "parents", component: ParentsComponent },
      { path: "schools", component: SchoolsComponent },
      { path: "students", component: StudentsComponent },
      { path: "tutors", component: TutorsComponent },
      { path: "terms", component: TermsConditionsComponent },
      { path: "imprint", component: ImpressumComponent },
      { path: "press", component: PressComponent },
      { path: "privacy", component: PrivacyComponent },
      { path: "about", component: AboutComponent },
      { path: "", component: HomeComponent },
      { path: "**", component: PageNotFoundComponent },
    ],
    resolve: { user: UserResolver },
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "enabled",
      initialNavigation: "enabled",
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
