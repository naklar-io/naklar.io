import { Injectable, PLATFORM_ID, Inject } from "@angular/core";
import { SwPush } from "@angular/service-worker";
import { HttpClient } from "@angular/common/http";
import { WebPushDevice, NotificationSettings } from "../_models";
import { isPlatformBrowser } from "@angular/common";
import { environment } from "src/environments/environment";
import { AuthenticationService } from "./authentication.service";
import { BehaviorSubject, Observable, combineLatest, from } from "rxjs";
import { mergeMap, flatMap, switchMap, map } from "rxjs/operators";

enum Browser {
  Chrome = "Chrome",
  Opera = "Opera",
  Firefox = "Firefox",
  Safari = "Safari",
  Unknown = "",
}

const supportedBrowsers = [Browser.Chrome, Browser.Opera, Browser.Firefox];

const defaultSettings = {
  enableMail: false,
  enablePush: false,
  notifyInterval: "00:05:00", // 5 minutes
  ranges: [],
  rangesMode: "ALLOW",
} as NotificationSettings;

@Injectable({
  providedIn: "root",
})
export class NotifyService {
  private settings: BehaviorSubject<NotificationSettings> = new BehaviorSubject(
    defaultSettings
  );
  private settings$: Observable<
    NotificationSettings
  > = this.settings.asObservable();

  private pushSubscription: BehaviorSubject<
    PushSubscription
  > = new BehaviorSubject(null);

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private swPush: SwPush,
    private http: HttpClient,
    private authService: AuthenticationService
  ) {
    console.debug("Notifyservice is live");
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
        let url = not.notification.data.url;
        window.open(url, "naklario_notification");
      }
    });
    this.swPush.messages.subscribe((message) => {
      console.log("[notify-service]", message);
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
      for (let b in Browser) {
        if (navigator.userAgent.indexOf(b) != -1) {
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

  // attempts to fetch settings from server
  private fetchSettings(): void {
    this.http
      .get<NotificationSettings>(`${environment.apiUrl}/notify/settings/`)
      .subscribe(
        (settings) => {
          this.settings.next(settings);
        },
        (error) => {
          console.log("Error fetching notification-settings", error);
        }
      );
  }

  private getPushDevices(): Observable<WebPushDevice[]> {
    return this.http.get<WebPushDevice[]>(
      `${environment.apiUrl}/notify/push/device/wp/`
    );
  }

  // check if push subscription exists and if its on the server. If not --> try to send it
  public ensurePushSubscription(): void {
    console.debug("ensuring");
    if (this.canPushSubscribe) {
      combineLatest(this.pushSubscription, this.getPushDevices()).subscribe(
        (values) => {
          let myPushDevice = this.pushSubToWebPushDev(values[0]).registrationId;
          let pushDevices = values[1].map((item) => {
            return item.registrationId;
          });
          if (!pushDevices.includes(myPushDevice)) {
            this.addPushSubscription(values[0]).subscribe();
          }
        }
      );
    }
  }

  public get hasPushSubscription(): boolean {
    return this.pushSubscription.value != null;
  }

  public get canPushSubscribe(): boolean {
    return this.swPush.isEnabled && supportedBrowsers.includes(this.browser);
  }

  public requestPushSubscription(): void {
    console.debug("requesting");

    this.swPush
      .requestSubscription({
        serverPublicKey: environment.vapidKey,
      })
      .then((x) => {
        this.addPushSubscription(x).subscribe(
          (result) => {
            console.debug("Successfully subscribed", result);
          },
          (error) => {
            console.error("Error while subscribing", error);
          }
        );
      })
      .catch((error) => {
        console.error("Subbing error", error);
      });
  }

  public updateSettings(
    newSettings: Partial<NotificationSettings>
  ): Observable<NotificationSettings> {
    return this.http
      .patch<NotificationSettings>(
        `${environment.apiUrl}/notify/settings/`,
        newSettings
      )
      .pipe(
        map((settings) => {
          this.settings.next(settings);
          return settings;
        })
      );
  }

  public addPushSubscription(sub: PushSubscription) {
    let pushJSON = sub.toJSON();
    let wpDevice: WebPushDevice;
    wpDevice = {
      registrationId: pushJSON.endpoint.split("/").slice(-1).pop(),
      p256dh: pushJSON.keys.p256dh,
      auth: pushJSON.keys.auth,
      browser: this.browser.toUpperCase(),
    };
    return this.http.post<WebPushDevice>(
      `${environment.apiUrl}/notify/push/device/wp/`,
      wpDevice
    );
  }

  private pushSubToWebPushDev(sub: PushSubscription) {
    let pushJSON = sub.toJSON();
    return {
      registrationId: pushJSON.endpoint.split("/").slice(-1).pop(),
      p256dh: pushJSON.keys.p256dh,
      auth: pushJSON.keys.auth,
      browser: this.browser.toUpperCase(),
    };
  }
}
