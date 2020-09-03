import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

/**
 *  BannerService for enabling / disabling the banner. Disabled per default.
 *
 */
@Injectable({ providedIn: 'root' })
export class BannerService {
  private displaySubject: BehaviorSubject<boolean>;
  readonly display: Observable<boolean>;

  constructor() {
    this.displaySubject = new BehaviorSubject<boolean>(false);
    this.display = this.displaySubject.asObservable();
  }

  hideBanner() {
    console.log('hiding banner');
    this.displaySubject.next(false);
    return this.display;
  }
  showBanner() {
    console.log('showing banner');
    this.displaySubject.next(true);
    return this.display;
  }
}
