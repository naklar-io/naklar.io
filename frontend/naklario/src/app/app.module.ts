import { BrowserModule, BrowserTransferStateModule } from '@angular/platform-browser';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

// Third party modules
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { LoadingBarRouterModule } from '@ngx-loading-bar/router';
import { LoadingBarHttpClientModule } from '@ngx-loading-bar/http-client';

import { JwtInterceptor, ErrorInterceptor } from './_helpers';

// Components
import { AppComponent } from './app.component';
import { AccountModule } from './account/account.module';
import { RouletteModule } from './roulette/roulette.module';

import { HomeComponent } from './home/home.component';
import { AboutComponent } from './home/misc/about/about.component';
import { DatenschutzComponent } from './home/misc/datenschutz/datenschutz.component';
import { HelpSupportComponent } from './home/misc/help-support/help-support.component';
import { FeedbackComponent } from './home/misc/feedback/feedback.component';
import { ImpressumComponent } from './home/misc/impressum/impressum.component';
import { ParentsComponent } from './home/misc/parents/parents.component';
import { PrivacyComponent } from './home/misc/privacy/privacy.component';
import { SchoolsComponent } from './home/misc/schools/schools.component';
import { StudentsComponent } from './home/misc/students/students.component';
import { TutorsComponent } from './home/misc/tutors/tutors.component';
import { TermsConditionsComponent } from './home/misc/terms-conditions/terms-conditions.component';
import { FooterComponent } from './home/misc/footer/footer.component';
import { NavbarComponent } from './home/misc/navbar/navbar.component';
import { PageNotFoundComponent } from './home/misc/page-not-found/page-not-found.component';

import {
    DatabaseService,
    AuthenticationService,
} from './_services';

import { MiscComponentsModule } from './_misc_components/misc-components.module';
import { MoreInformationComponent } from './home/more-information/more-information.component';
import { BannerComponent } from './home/misc/banner/banner.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { PartnersComponent } from './home/more-information/partners/partners.component';
import { FeaturesComponent } from './home/more-information/features/features.component';
import { VideoComponent } from './home/more-information/video/video.component';
import { MissionComponent } from './home/more-information/mission/mission.component';
import { NumbersComponent } from './home/more-information/numbers/numbers.component';
import { TeamComponent } from './home/more-information/team/team.component';
import { JoinTheCommunityComponent } from './home/more-information/join-the-community/join-the-community.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NotifyModule } from './notify/notify.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { PressComponent } from './home/misc/press/press.component';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Angulartics2Module } from 'angulartics2';
import { FaIconLibrary, FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { SchedulingModule } from './scheduling/scheduling.module';
import { SharedModule } from './@shared/shared.module';
import { PartnerComponent } from './home/misc/partner/partner.component';
import { switchMap } from 'rxjs/operators';
import { ConfigService } from './_services/config.service';


@NgModule({
    declarations: [
        AppComponent,
        HomeComponent,
        MoreInformationComponent,
        AboutComponent,
        DatenschutzComponent,
        FeedbackComponent,
        HelpSupportComponent,
        ImpressumComponent,
        ParentsComponent,
        PrivacyComponent,
        SchoolsComponent,
        StudentsComponent,
        TutorsComponent,
        TermsConditionsComponent,
        FooterComponent,
        NavbarComponent,
        PageNotFoundComponent,
        BannerComponent,
        DashboardComponent,
        PartnersComponent,
        FeaturesComponent,
        VideoComponent,
        MissionComponent,
        NumbersComponent,
        TeamComponent,
        JoinTheCommunityComponent,
        PressComponent,
        PartnerComponent,
    ],
    imports: [
        NgbModule,

        BrowserModule.withServerTransition({ appId: 'serverApp' }),
        BrowserTransferStateModule,
        BrowserAnimationsModule,
        HttpClientModule,
        Angulartics2Module.forRoot(),
        // Loading bar
        LoadingBarHttpClientModule,
        LoadingBarRouterModule,
        // Material
        MatSnackBarModule,
        // Stuff for reactive / template driven forms
        ReactiveFormsModule,
        FormsModule,
        // modules (arbitrary order)

        AccountModule,
        RouletteModule,
        MiscComponentsModule,
        NotifyModule,
        SchedulingModule,
        SharedModule,

        // AppRoutingComponent needs to be the last routing module
        AppRoutingModule,
        // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
        ServiceWorkerModule.register('custom-service-worker.js', {
            enabled: environment.production,
        }),
        FontAwesomeModule,
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: (settings: ConfigService) => () => settings.getSettings(),
            multi: true,
            deps: [ConfigService],
        },
        { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {
    constructor(library: FaIconLibrary) {
        library.addIconPacks(fas);
    }
}
