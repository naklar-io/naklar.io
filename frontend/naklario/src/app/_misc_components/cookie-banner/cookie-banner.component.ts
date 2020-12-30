import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TrackingConsentSettings } from 'src/app/_models';
import { TrackingConsentService } from 'src/app/_services/tracking-consent.service';
import { environment } from 'src/environments/environment';
import {
  trigger,
  state,
  style,
  animate,
  transition,
} from '@angular/animations';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
  selector: 'misc-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
  animations: [
    trigger('popIn', [
      transition(':enter', [
        style({ transform: 'translateY(100%)' }),
        animate('500ms 1s cubic-bezier(.18,.89,.32,1.28)', style({ transform: 'translateY(0%)' })),
      ]),
      transition(':leave', [
        style({ transform: 'translateY(0%)' }),
        animate('250ms 0s ease-in-out', style({ transform: 'translateY(100%)' })),
      ])
    ])
  ]
})
export class CookieBannerComponent implements OnInit {
  isVisible: Observable<boolean>;
  isSettings = false;
  featureEnabled$;
  currentSettings: TrackingConsentSettings;

  constructor(public trackingConsent: TrackingConsentService) {
    this.isVisible = trackingConsent.trackingAsked$.pipe(
      map((value) => !value)
    );
    this.currentSettings = trackingConsent.currentTrackingSettings;
    this.featureEnabled$ = ConfigService.config$.pipe(map(config => config.features.analytics));
  }

  ngOnInit(): void {}

  allowAllAnalytics() {
    this.trackingConsent.changeTrackingSettings({
      googleAnalytics: true,
      comfort: true
    });
  }

  saveSettings(){
    this.trackingConsent.changeTrackingSettings(this.currentSettings);
  }

  displaySettings(isSettings) {
    this.isSettings = isSettings;
  }
}
