import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { TrackingConsentSettings } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class TrackingConsentService {

  TRACKING_KEY = 'trackingSettings';
  private trackingSettings: BehaviorSubject<TrackingConsentSettings> = new BehaviorSubject({
    googleAnalytics: false
  });
  public trackingSettings$ = this.trackingSettings.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
  ) {
    if (isPlatformBrowser(platformId)) {
      const value = JSON.parse(localStorage.getItem(this.TRACKING_KEY));
      this.trackingSettings.next(value);
      this.trackingSettings$.subscribe((allowValue) => {
        localStorage.setItem(this.TRACKING_KEY, JSON.stringify(allowValue));
      });
    }
  }

  public changeTrackingSettings(settings: TrackingConsentSettings): void {
    this.trackingSettings.next(settings);
  }

  public disableTracking(): void {
    const shouldReload = this.trackingSettings.value.googleAnalytics;
    this.trackingSettings.next({googleAnalytics: false});
    if (shouldReload) {
      try {
        window.location.reload();
      } catch {
        console.error('Couldnt reload');
      }
    }
  }
}
