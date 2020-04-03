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
import { CallComponent } from "./call/call.component";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { NavbarComponent } from "./misc/navbar/navbar.component";
import { FooterComponent } from "./misc/footer/footer.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";
import { AccountModule } from "./account/account.module";
import { RouletteModule } from "./roulette/roulette.module";

import { EmailFormComponent } from "./landing/email-form/email-form.component";

import { ImpressumComponent } from "./impressum/impressum.component";
import { AboutComponent } from "./about/about.component";
import { DatenschutzComponent } from "./datenschutz/datenschutz.component";
import { DatabaseService, AuthenticationService } from "./_services";

@NgModule({
  declarations: [
    AppComponent,
    CallComponent,
    HomeComponent,
    LandingComponent,
    NavbarComponent,
    PageNotFoundComponent,
    EmailFormComponent,
    FooterComponent,
    ImpressumComponent,
    AboutComponent,
    DatenschutzComponent
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
    AppRoutingModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    // Singleton Services
    DatabaseService,
    AuthenticationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
