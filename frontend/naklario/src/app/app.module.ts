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
import { CallComponent } from "./call/call.component";
import { HomeComponent } from "./home/home.component";
import { LandingComponent } from "./landing/landing.component";
import { NavbarComponent } from "./misc/navbar/navbar.component";
import { FooterComponent } from "./misc/footer/footer.component";
import { PageNotFoundComponent } from "./misc/page-not-found/page-not-found.component";
import { AccountModule } from "./account/account.module";
import { ImpressumComponent } from './impressum/impressum.component';
import { AboutComponent } from './about/about.component';
import { DatenschutzComponent } from './datenschutz/datenschutz.component';

@NgModule({
  declarations: [
    AppComponent,
    RouletteComponent,
    CallComponent,
    HomeComponent,
    LandingComponent,
    NavbarComponent,
    FooterComponent,
    PageNotFoundComponent,
    ImpressumComponent,
    AboutComponent,
    DatenschutzComponent
<<<<<<< HEAD
  ],
  imports: [
    NgbModule,
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    // modules (arbitrary order)
    AccountModule,
    // AppRoutingComponent needs to be the last routing module
    AppRoutingModule,
=======
>>>>>>> 9669db06510353216b53e1e80af4137f170f19f0
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
