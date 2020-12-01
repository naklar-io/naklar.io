import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { TrackingConsentSettings } from '../_models';

@Injectable({
  providedIn: 'root'
})
export class TrackingConsentService {

  TRACKING_KEY = 'trackingSettings';
  TRACKING_ASKED_KEY = 'trackingAsked';
  private trackingSettings: BehaviorSubject<TrackingConsentSettings> = new BehaviorSubject({
    googleAnalytics: false
  });
  public trackingSettings$ = this.trackingSettings.asObservable();

  private trackingAsked: BehaviorSubject<boolean> = new BehaviorSubject(false);
  public trackingAsked$ = this.trackingAsked.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private http: HttpClient
  ) {
    if (environment.features.analytics) {
      if (isPlatformBrowser(platformId)) {
        const settingsValue = JSON.parse(localStorage.getItem(this.TRACKING_KEY));
        if (settingsValue != null) {
          this.trackingSettings.next(settingsValue);
        }
        this.trackingSettings$.subscribe((allowValue) => {
          localStorage.setItem(this.TRACKING_KEY, JSON.stringify(allowValue));
        });
        const wasAsked = JSON.parse(localStorage.getItem(this.TRACKING_ASKED_KEY));
        this.trackingAsked.next(wasAsked);
        this.trackingAsked$.subscribe((wasAskedValue) => {
          localStorage.setItem(this.TRACKING_ASKED_KEY, JSON.stringify(wasAskedValue));
        });
      }
    } else {
      if (isPlatformBrowser(platformId)) {
        // make sure analytics aren't being sent, by setting localstorage
        localStorage.setItem(this.TRACKING_KEY, JSON.stringify({
          googleAnalytics: false
        }));
        localStorage.setItem(this.TRACKING_ASKED_KEY, 'false');
      }
    }
  }

  public changeTrackingSettings(settings: TrackingConsentSettings): void {
    this.trackingSettings.next(settings);
    this.trackingAsked.next(true);
  }

  public disableTracking(): void {
    this.http.post(`${environment.apiUrl}/account/count-tracking-deny/`, {}).subscribe();
    this.trackingAsked.next(true);
    const shouldReload = this.trackingSettings.value.googleAnalytics;
    this.trackingSettings.next({ googleAnalytics: false });
    if (shouldReload) {
      try {
        window.location.reload();
      } catch {
        console.error('Couldnt reload');
      }
    }
  }
  public resetTracking(): void {
    this.trackingAsked.next(false);
  }
}
