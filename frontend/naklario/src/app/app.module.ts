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
import { RouletteComponent } from "./roulette/roulette.component";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { NavbarComponent } from "./_misc_components/navbar/navbar.component";
import { FooterComponent } from "./_misc_components/footer/footer.component";
import { PageNotFoundComponent } from "./_misc_components/page-not-found/page-not-found.component";
import { AccountModule } from "./account/account.module";

import { EmailFormComponent } from "./landing/email-form/email-form.component";

import { ImpressumComponent } from "./_misc_components/impressum/impressum.component";
import { AboutComponent } from "./about/about.component";
import { DatenschutzComponent } from "./_misc_components/datenschutz/datenschutz.component";
import { DatabaseService, AuthenticationService} from "./_services";

@NgModule({
  declarations: [
    AppComponent,
    RouletteComponent,
    HomeComponent,
    LandingComponent,
    NavbarComponent,
    PageNotFoundComponent,
    EmailFormComponent,
    FooterComponent,
    ImpressumComponent,
    AboutComponent,
    DatenschutzComponent,
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
    // AppRoutingComponent needs to be the last routing module
    AppRoutingModule,
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    AuthenticationService,
    DatabaseService
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
