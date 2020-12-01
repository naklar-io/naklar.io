import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TrackingConsentSettings } from 'src/app/_models';
import { TrackingConsentService } from 'src/app/_services/tracking-consent.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'misc-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss'],
})
export class CookieBannerComponent implements OnInit {
  isVisible: Observable<boolean>;
  isSettings = false;
  featureEnabled = environment.features.analytics;
  currentSettings: TrackingConsentSettings;

  constructor(public trackingConsent: TrackingConsentService) {
    this.isVisible = trackingConsent.trackingAsked$.pipe(
      map((value) => !value)
    );
    this.currentSettings = trackingConsent.currentTrackingSettings;
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
