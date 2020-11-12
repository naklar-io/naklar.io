import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Renderer2,
  AfterViewInit,
  DoCheck, HostListener
} from '@angular/core';
import { Angulartics2GoogleTagManager } from 'angulartics2/gtm';
import {
  NotifyService,
  PromptUpdateService,
  AppLayoutService,
} from './_services';
import { ScrollPositionService } from './_services/scroll-position.service';
import { TrackingConsentService } from './_services/tracking-consent.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  providers: [AppLayoutService, ScrollPositionService]
})
export class AppComponent implements OnInit, AfterViewInit, DoCheck {
  @ViewChild('app') app: ElementRef;
  @ViewChild('main') main: ElementRef;

  public fullscreen = false;

  title = 'naklar.io';
  constructor(
    private notify: NotifyService,
    private promptUpdate: PromptUpdateService,
    private layoutService: AppLayoutService,
    private renderer: Renderer2,
    private angulartics2GoogleTagManager: Angulartics2GoogleTagManager,
    public trackingConsent: TrackingConsentService,
  ) {
    this.promptUpdate.checkForUpdates();
    trackingConsent.allowTracking$.subscribe((allow) => {
      if (allow) {
        this.angulartics2GoogleTagManager.startTracking();
      }
    });
  }

  ngDoCheck(): void {
    if (this.fullscreen !== this.layoutService.isFullscreen){
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
  }
}
