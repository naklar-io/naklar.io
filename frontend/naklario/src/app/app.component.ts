import { isPlatformBrowser } from '@angular/common';
import {
    Component,
    OnInit,
    ViewChild,
    ElementRef,
    Renderer2,
    AfterViewInit,
    DoCheck,
    HostListener,
    OnDestroy,
    PLATFORM_ID,
    Inject,
} from '@angular/core';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import { BehaviorSubject, interval, merge, of, Subscription } from 'rxjs';
import { startWith, switchMap } from 'rxjs/operators';
import {
    NotifyService,
    PromptUpdateService,
    AppLayoutService,
    AuthenticationService,
    DatabaseService,
} from './_services';
import { ScrollPositionService } from './_services/scroll-position.service';
import { ConfigService } from './_services/config.service';
import { TrackingConsentService } from './_services/tracking-consent.service';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    providers: [AppLayoutService, ScrollPositionService],
})
export class AppComponent implements OnInit, OnDestroy, AfterViewInit, DoCheck {
    @ViewChild('app') app: ElementRef;
    @ViewChild('main') main: ElementRef;

    private visibilityState: VisibilityState = 'visible';
    private userRefresh$ = new BehaviorSubject<null>(null);
    private userRefreshInterval$ = interval(30 * 60 * 1000).pipe(startWith(0));
    private userRefreshSub: Subscription;

    public fullscreen = false;
    isBrowser = false;

    title = 'naklar.io';
    constructor(
        private notify: NotifyService,
        private promptUpdate: PromptUpdateService,
        private layoutService: AppLayoutService,
        private renderer: Renderer2,
        private angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
        public trackingConsent: TrackingConsentService,
        private auth: AuthenticationService,
        private db: DatabaseService,
        private settings: ConfigService,
        @Inject(PLATFORM_ID) platformId
    ) {
        this.isBrowser = isPlatformBrowser(platformId);
    }

    ngDoCheck(): void {
        if (this.fullscreen !== this.layoutService.isFullscreen) {
            this.fullscreen = this.layoutService.isFullscreen;
        }
    }

    ngAfterViewInit(): void {
        this.layoutService.scrollable$.subscribe((scrollable) => {
            if (scrollable) {
                try {
                    this.renderer.removeClass(this.app.nativeElement, 'noscroll');
                } catch {
                    console.error('couldnt remove scrollable class');
                }
            } else {
                this.renderer.addClass(this.app.nativeElement, 'noscroll');
            }
        });
    }

    ngOnInit(): void {
        this.promptUpdate.checkForUpdates();
        this.settings.features.subscribe((features) => {
            if (features.analytics) {
                this.trackingConsent.trackingSettings$.subscribe((settings) => {
                    if (settings.googleAnalytics) {
                        this.angulartics2GoogleTagManager.startTracking();
                    }
                });
            }
        });
        if (this.isBrowser) {
            this.userRefreshSub = merge(this.userRefresh$, this.userRefreshInterval$)
                .pipe(
                    switchMap(() => {
                        if (this.auth.isLoggedIn) {
                            console.log('getting user');
                            return this.db
                                .getConstants()
                                .pipe(switchMap((constants) => this.auth.fetchUserData(constants)));
                        } else {
                            console.log('returning null');
                            return of(null);
                        }
                    })
                )
                .subscribe((val) => {
                    console.log('got result', val);
                });
        }
    }

    ngOnDestroy(): void {
        this.userRefreshSub?.unsubscribe();
    }

    @HostListener('document:visibilitychange', ['$event'])
    onFocus(event: Event): void {
        const doc: Document = event.target as Document;
        const visibilityState: VisibilityState = doc.visibilityState;
        if (this.visibilityState !== visibilityState) {
            if (this.visibilityState === 'hidden' && this.auth.isLoggedIn) {
                this.userRefresh$.next(null);
            }
            this.visibilityState = visibilityState;
        }
    }
}
