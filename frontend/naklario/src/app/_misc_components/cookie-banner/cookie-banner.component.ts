import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TrackingConsentService } from 'src/app/_services/tracking-consent.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'misc-cookie-banner',
  templateUrl: './cookie-banner.component.html',
  styleUrls: ['./cookie-banner.component.scss']
})
export class CookieBannerComponent implements OnInit {

  isVisible: Observable<boolean>;
  featureEnabled = environment.features.analytics;

  constructor(public trackingConsent: TrackingConsentService) {
    this.isVisible = trackingConsent.trackingAsked$.pipe(map(value => !value));
  }

  ngOnInit(): void {
  }

  allowAnalytics() {
    this.trackingConsent.changeTrackingSettings({
      googleAnalytics: true,
    });
  }

  disallowAnalytics() {
    this.trackingConsent.disableTracking();
  }

}
