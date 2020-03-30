import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { AppRoutingModule } from "./app-routing.module";
import { ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule, HttpClient } from "@angular/common/http";

// Third party modules
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";

// Components
import { AppComponent } from "./app.component";
import { RouletteComponent } from "./roulette/roulette.component";
import { AccountComponent } from "./account/account.component";
import { CallComponent } from "./call/call.component";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { NavbarComponent } from "./misc/navbar/navbar.component";
import { FooterComponent } from "./misc/footer/footer.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";
import { ImpressumComponent } from './impressum/impressum.component';
import { AboutComponent } from './about/about.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';

@NgModule({
  declarations: [
    AppComponent,
    RouletteComponent,
    AccountComponent,
    CallComponent,
    HomeComponent,
    LandingComponent,
    NavbarComponent,
    FooterComponent,
    PageNotFoundComponent,
    ImpressumComponent,
    AboutComponent,
    DatenschutzComponent
  ],
  imports: [NgbModule, BrowserModule,HttpClientModule,  AppRoutingModule, ReactiveFormsModule],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
