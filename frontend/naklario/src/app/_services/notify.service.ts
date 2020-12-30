import { Injectable, PLATFORM_ID, Inject } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { HttpClient } from '@angular/common/http';
import { WebPushDevice, NotificationSettings } from '../_models';
import { isPlatformBrowser } from '@angular/common';
import { environment } from 'src/environments/environment';
import { AuthenticationService } from './authentication.service';
import { BehaviorSubject, Observable, combineLatest, from } from 'rxjs';
import { mergeMap, flatMap, switchMap, map } from 'rxjs/operators';
import { ConfigService } from './config.service';
import { ApiService } from './database/api.service';

enum Browser {
  Chrome = 'Chrome',
  Opera = 'Opera',
  Firefox = 'Firefox',
  Safari = 'Safari',
  Unknown = '',
}

const saneModulus = (a, b) => ((a % b) + b) % b;
const supportedBrowsers = [Browser.Chrome, Browser.Opera, Browser.Firefox];

const defaultSettings = {
  enableMail: false,
  enablePush: false,
  notifyInterval: '00:05:00', // 5 minutes
  ranges: [],
  rangesMode: 'ALLOW',
} as NotificationSettings;

@Injectable({
  providedIn: 'root',
})
export class NotifyService {

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private swPush: SwPush,
    private api: ApiService,
    private authService: AuthenticationService
  ) {
    // console.debug('Notifyservice is live');
    authService.isLoggedIn$.subscribe((loggedIn) => {
      if (loggedIn) {
        this.fetchSettings();
      }
    });

    this.swPush.subscription.subscribe((sub) => {
      this.pushSubscription.next(sub);
      if (this.authService.isLoggedIn && this.currentSettings.enablePush) {
        if (sub === null) {
          this.requestPushSubscription();
        } else {
          this.ensurePushSubscription();
        }
      }
    });
    this.swPush.notificationClicks.subscribe((not) => {
      if (not.notification.data) {
        const url = not.notification.data.url;
        window.open(url, 'naklario_notification');
      }
    });
    this.swPush.messages.subscribe((message) => {
      console.log('[notify-service]', message);
    });

    this.settings.subscribe((set) => {
      if (set.enablePush) {
        if (this.hasPushSubscription) {
          this.ensurePushSubscription();
        } else {
          // TODO
        }
      }
    });
  }

  private get browser(): Browser {
    if (isPlatformBrowser(this.platformId)) {
      for (const b in Browser) {
        if (navigator.userAgent.indexOf(b) !== -1) {
          return Browser[b];
        }
      }
    } else {
      return Browser.Unknown;
    }
  }

  public get currentSettings(): NotificationSettings {
    return this.settings.value;
  }

  public get currentSettings$(): Observable<NotificationSettings> {
    return this.settings$;
  }

  public get hasPushSubscription(): boolean {
    return this.pushSubscription.value != null;
  }

  public get canPushSubscribe(): boolean {
    return this.swPush.isEnabled && supportedBrowsers.includes(this.browser);
  }
  private settings: BehaviorSubject<NotificationSettings> = new BehaviorSubject(
    defaultSettings
  );
  private settings$: Observable<
    NotificationSettings
  > = this.settings.asObservable();

  private pushSubscription: BehaviorSubject<
    PushSubscription
  > = new BehaviorSubject(null);

  /* Converts time to UTC */
  public static convertToUTC(time: string): string {
    const splits = time.split(':');
    // assume max 00:00:00
    let seconds = 0;
    if (splits.length === 3) {
      seconds += 3600 * parseInt(splits[0], 10);
      seconds += 60 * parseInt(splits[1], 10);
      seconds += parseInt(splits[2], 10);
    } else if (splits.length === 2) {
      seconds += 3600 * parseInt(splits[0], 10);
      seconds += 60 * parseInt(splits[1], 10);
    }
    seconds = seconds + new Date().getTimezoneOffset() * 60;
    const hours = saneModulus(Math.floor(seconds / 3600), 24);
    const minutes = saneModulus(Math.floor((seconds % 3600) / 60), 60);
    seconds = saneModulus(seconds, 60);
    console.log(hours, minutes, seconds);
    return (
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }
  /* Converts time to local time */
  public static convertToLocal(time: string): string {
    const splits = time.split(':');
    // assume max 00:00:00
    // min 00 seconds
    let seconds = 0;
    if (splits.length === 3) {
      seconds += 3600 * parseInt(splits[0], 10);
      seconds += 60 * parseInt(splits[1], 10);
      seconds += parseInt(splits[2], 10);
    } else if (splits.length === 2) {
      seconds += 3600 * parseInt(splits[0], 10);
      seconds += 60 * parseInt(splits[1], 10);
    }
    seconds = seconds - new Date().getTimezoneOffset() * 60;
    const hours = saneModulus(Math.floor(seconds / 3600), 24);
    const minutes = saneModulus(Math.floor((seconds % 3600) / 60), 60);
    seconds = saneModulus(seconds, 60);
    console.log(hours, minutes, seconds);
    return (
      hours.toString().padStart(2, '0') +
      ':' +
      minutes.toString().padStart(2, '0') +
      ':' +
      seconds.toString().padStart(2, '0')
    );
  }

  // attempts to fetch settings from server
  private fetchSettings(): void {
    this.api
      .get<NotificationSettings>(`/notify/settings/`)
      .subscribe(
        (settings) => {
          settings = this.convertToLocal(settings);
          this.settings.next(settings);
        },
        (error) => {
          console.log('Error fetching notification-settings', error);
        }
      );
  }

  private getPushDevices(): Observable<WebPushDevice[]> {
    return this.api.get<WebPushDevice[]>(
      `${ConfigService.config.apiUrl}/notify/push/device/wp/`
    );
  }

  // check if push subscription exists and if its on the server. If not --> try to send it
  public ensurePushSubscription(): void {
    // console.debug('ensuring');
    if (this.canPushSubscribe) {
      combineLatest([this.pushSubscription, this.getPushDevices()]).subscribe(
        (values) => {
          const myPushDevice = this.pushSubToWebPushDev(values[0]).registrationId;
          const pushDevices = values[1].map((item) => {
            return item.registrationId;
          });
          if (!pushDevices.includes(myPushDevice)) {
            this.addPushSubscription(values[0]).subscribe();
          }
        }
      );
    }
  }

  public requestPushSubscription(): void {
    // console.debug('requesting');

    this.swPush
      .requestSubscription({
        serverPublicKey: environment.vapidKey,
      })
      .then((x) => {
        this.addPushSubscription(x).subscribe(
          (result) => {
            console.log('Successfully subscribed', result);
          },
          (error) => {
            console.error('Error while subscribing', error);
          }
        );
      })
      .catch((error) => {
        console.error('Subbing error', error);
      });
  }

  public updateSettings(
    newSettings: NotificationSettings
  ): Observable<NotificationSettings> {
    return this.http
      .put<NotificationSettings>(
        `${ConfigService.config.apiUrl}/notify/settings/`,
        this.convertToUTC(newSettings)
      )
      .pipe(
        map(
          (settings) => {
            settings = this.convertToLocal(settings);
            this.settings.next(settings);
            return settings;
          },
          (error) => {
            console.log('Missing settings, trying to create them', error);
            return this.createSettings(newSettings);
          }
        )
      );
  }

  public createSettings(newSettings: NotificationSettings) {
    return this.http
      .post<NotificationSettings>(
        `${ConfigService.config.apiUrl}/notify/settings/`,
        this.convertToUTC(newSettings)
      )
      .pipe(
        map((settings) => {
          settings = this.convertToLocal(settings);
          this.settings.next(settings);
          return settings;
        })
      );
  }

  private convertToUTC(settings: NotificationSettings): NotificationSettings {
    return Object.assign(settings, {
      ranges: settings.ranges.map((range) => {
        return {
          days: range.days,
          startTime: NotifyService.convertToUTC(range.startTime),
          endTime: NotifyService.convertToUTC(range.endTime),
          pk: range.pk,
        };
      }),
    });
  }

  private convertToLocal(settings: NotificationSettings): NotificationSettings {
    return Object.assign(settings, {
      ranges: settings.ranges.map((range) => {
        return {
          days: range.days,
          startTime: NotifyService.convertToLocal(range.startTime),
          endTime: NotifyService.convertToLocal(range.endTime),
          pk: range.pk,
        };
      }),
    });
  }

  public addPushSubscription(sub: PushSubscription) {
    const pushJSON = sub.toJSON();
    let wpDevice: WebPushDevice;
    wpDevice = {
      registrationId: pushJSON.endpoint.split('/').slice(-1).pop(),
      p256dh: pushJSON.keys.p256dh,
      auth: pushJSON.keys.auth,
      browser: this.browser.toUpperCase(),
    };
    return this.http.post<WebPushDevice>(
      `${ConfigService.config.apiUrl}/notify/push/device/wp/`,
      wpDevice
    );
  }

  private pushSubToWebPushDev(sub: PushSubscription) {
    const pushJSON = sub.toJSON();
    return {
      registrationId: pushJSON.endpoint.split('/').slice(-1).pop(),
      p256dh: pushJSON.keys.p256dh,
      auth: pushJSON.keys.auth,
      browser: this.browser.toUpperCase(),
    };
  }
}
