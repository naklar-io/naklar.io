import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TrackingConsentService {

  TRACKING_KEY = 'trackingAllowed';
  private allowTracking = new BehaviorSubject(false);
  public allowTracking$ = this.allowTracking.asObservable();

  constructor(
    @Inject(PLATFORM_ID) private platformId,
  ) {
    if (isPlatformBrowser(platformId)) {
      const value = JSON.parse(localStorage.getItem(this.TRACKING_KEY));
      this.allowTracking.next(value);
      this.allowTracking$.subscribe((allowValue) => {
        localStorage.setItem(this.TRACKING_KEY, JSON.stringify(allowValue));
      });
    }
  }

  public enableTracking(): void {
    this.allowTracking.next(true);
  }

  public disableTracking(): void {
    const shouldReload = this.allowTracking.value;
    this.allowTracking.next(false);
    if (shouldReload) {
      try {
        window.location.reload();
      } catch {
        console.error('Couldnt reload');
      }
    }
  }
}
