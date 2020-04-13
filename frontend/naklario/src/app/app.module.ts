import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";

// Third party modules
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

import { JwtInterceptor, ErrorInterceptor } from "./_helpers";

// Components
import { AppComponent } from "./app.component";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { AccountModule } from "./account/account.module";
import { RouletteModule } from "./roulette/roulette.module";

import { EmailFormComponent } from "./landing/email-form/email-form.component";

import {
  ImpressumComponent,
  AboutComponent,
  DatenschutzComponent,
  PrivacyComponent,
  PageNotFoundComponent,
  FooterComponent,
  NavbarComponent,
  UserCardComponent,
} from "./_misc_components";

import {
  DatabaseService,
  AuthenticationService,
  ToastService,
  RouletteService,
} from "./_services";
import { ParentsComponent } from "./_misc_components/parents/parents.component";
import { StudentsComponent } from "./_misc_components/students/students.component";
import { TutorsComponent } from "./_misc_components/tutors/tutors.component";
import { SchoolsComponent } from "./_misc_components/schools/schools.component";
import { HelpSupportComponent } from "./_misc_components/help-support/help-support.component";
import { FeedbackComponent } from "./_misc_components/feedback/feedback.component";
import { ToastsComponent } from "./_misc_components/toasts/toasts.component";
import { MoreInformationComponent } from "./home/more-information/more-information.component";

@NgModule({
  declarations: [
    AppComponent,

    HomeComponent,
    LandingComponent,
    NavbarComponent,
    PageNotFoundComponent,
    EmailFormComponent,
    FooterComponent,
    ImpressumComponent,
    AboutComponent,
    DatenschutzComponent,
    PrivacyComponent,
    ParentsComponent,
    StudentsComponent,
    TutorsComponent,
    SchoolsComponent,
    HelpSupportComponent,
    FeedbackComponent,
    ToastsComponent,
    MoreInformationComponent,
    UserCardComponent,
  ],
  imports: [
    NgbModule,
    BrowserModule,
    HttpClientModule,
    // Stuff for reactive / template driven forms
    ReactiveFormsModule,
    FormsModule,
    // modules (arbitrary order)
    AccountModule,
    RouletteModule,
    // AppRoutingComponent needs to be the last routing module
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthenticationService,
    DatabaseService,
    RouletteService,
    ToastService,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
