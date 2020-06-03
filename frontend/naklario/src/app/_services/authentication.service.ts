import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, of } from "rxjs";
import {
  User,
  SendableUser,
  SendableLogin,
  sendableToLocalUser,
  Constants,
  State,
  TutorData,
  WebPushDevice,
} from "../_models";
import { environment } from "../../environments/environment";
import { map, flatMap, tap, take, mergeMap, first } from "rxjs/operators";
import { DatabaseService } from "./database.service";
import { isPlatformBrowser } from "@angular/common";

interface LoginResponse {
  token: string;
  expiry: string;
}

export type AccountType = "student" | "tutor" | "both";
enum Browser {
  Chrome = "Chrome",
  Opera = "Opera",
  Firefox = "Firefox",
  Safari = "Safari",
  Unknown = ""
}

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  public currentUser: Observable<User>;

  private currentUserSubject: BehaviorSubject<User>;
  private loggedIn: BehaviorSubject<boolean>;
  private loggedIn$: Observable<boolean>;

  private lastUpdate: Date;
  private updateInterval = 60; // account update interval in seconds

  private constants$: Observable<Constants>;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private databaseService: DatabaseService
  ) {
    let user: User;
    // Only use localStorage in Browser
    if (isPlatformBrowser(platformId)) {
      user = JSON.parse(localStorage.getItem("currentUser")) as User;
    }
    let loggedIn = false;
    // is the login still valid ?
    if (
      user &&
      user.token &&
      (!user.tokenExpiry || Date.parse(user.tokenExpiry) > Date.now())
    ) {
      console.log("loaded logged in user from local storage");
      loggedIn = true;
    } else {
      user = new User(
        "",
        "",
        "",
        "",
        null,
        null,
        null,
        false,
        false,
        null,
        "",
        ""
      );
      loggedIn = false;
      console.log("no user found in localstorage");
    }

    this.loggedIn = new BehaviorSubject<boolean>(loggedIn);
    this.loggedIn$ = this.loggedIn.asObservable();

    this.currentUserSubject = new BehaviorSubject<User>(user);
    this.currentUser = this.currentUserSubject.asObservable();
    // automatically update User in localStorage on change
    // only if in browser
    if (isPlatformBrowser(platformId)) {
      this.currentUser.subscribe((user) =>
        localStorage.setItem("currentUser", JSON.stringify(user))
      );
    }
  }

  private get browser(): Browser {
    if (isPlatformBrowser(this.platformId)) {
      for (let b in Browser) {
        if (navigator.userAgent.indexOf(b) != -1) {
          return Browser[b];
        }
      }
    } else {
      return Browser.Unknown
    }
  }

  public get isLoggedIn(): boolean {
    return this.loggedIn.value;
  }
  public get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn$;
  }
  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  public getAccountType(): Observable<AccountType> {
    return this.currentUserSubject.pipe(
      map((s) => {
        if (s.tutordata && s.studentdata) {
          return "both";
        } else if (s.tutordata) {
          return "tutor";
        } else {
          return "student";
        }
      })
    );
  }

  public updateUser(user: Partial<SendableUser>, constants: Constants) {
    return this.http
      .patch<SendableUser>(`${environment.apiUrl}/account/current/`, user)
      .pipe(
        map((user) => {
          const u = sendableToLocalUser(user, constants);
          // replace tokens
          const newUser = Object.assign(u, {
            token: this.currentUserValue.token,
            tokenExpiry: this.currentUserValue.tokenExpiry,
          });
          this.currentUserSubject.next(newUser);
          return user;
        })
      );
  }

  public register(user: SendableUser, constants: Constants) {
    return this.http
      .post<SendableUser>(`${environment.apiUrl}/account/create/`, user)
      .pipe(
        map((user) => {
          const u = sendableToLocalUser(user, constants);
          // this.currentUserSubject.next(u);
          return user;
        })
      );
  }

  public login(login: SendableLogin, constants: Constants) {
    return this.http
      .post<LoginResponse>(
        `${environment.apiUrl}/account/login/`,
        {},
        {
          headers: new HttpHeaders({
            Authorization: "Basic " + btoa(`${login.email}:${login.password}`),
          }),
        }
      )
      .pipe(
        map((response) => {
          console.log("Got Login response:", response);
          let user = new User(
            "",
            "",
            "",
            "",
            null,
            null,
            null,
            false,
            false,
            null,
            "",
            ""
          );
          user.token = response.token;
          user.tokenExpiry = response.expiry;
          this.currentUserSubject.next(user);
          this.loggedIn.next(true);
          return response;
        })
      )
      .pipe(
        flatMap(() => {
          const user$ = this.fetchUserData(constants);
          user$.subscribe();
          console.log("Logged in user:", this.currentUserValue);
          return user$;
        })
      );
  }

  public fetchUserData(constants: Constants) {
    if (this.isLoggedIn) {
      return this.http
        .get<SendableUser>(`${environment.apiUrl}/account/current/`)
        .pipe(
          map((user) => {
            const u = sendableToLocalUser(user, constants);
            const filledUser = Object.assign(u, {
              token: this.currentUserValue.token,
              tokenExpiry: this.currentUserValue.tokenExpiry,
            }) as User;
            console.log(filledUser);
            this.currentUserSubject.next(filledUser);
            return filledUser;
          })
        );
    }
    return this.currentUser;
  }

  public refreshTutorVerified() {
    return this.http
      .get<SendableUser>(`${environment.apiUrl}/account/current/`)
      .pipe(
        map((user) => {
          const updatedUser = Object.assign(this.currentUserValue, {
            tutordata: Object.assign(this.currentUserValue.tutordata, {
              verified: user.tutordata.verified,
            }) as TutorData,
          }) as User;
          this.currentUserSubject.next(updatedUser);
          return updatedUser;
        })
      );
  }

  /**
   * logout current user
   */
  public logout() {
    if (this.isLoggedIn) {
      this.http.post(`${environment.apiUrl}/account/logout/`, null).subscribe();
      this.currentUserSubject.next(null);
      this.loggedIn.next(false);
    }
  }

  /**
   * logout all devices (invalidates all user tokens)
   */
  public logoutAll() {
    this.http
      .post(`${environment.apiUrl}/account/logoutall/`, null)
      .subscribe();
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
  }

  public verify(token: string) {
    return this.http
      .post<null>(`${environment.apiUrl}/account/email/verify/${token}/`, null)
      .pipe(
        tap((v) => {
          // set verified to true
          this.currentUserValue.emailVerified = true;
          this.currentUserSubject.next(this.currentUserValue);
        })
      );
  }

  public resendVerify() {
    return this.http.post(
      `${environment.apiUrl}/account/email/resend_verification/`,
      null
    );
  }

  public requestPasswordReset(email: string) {
    return this.http.post(
      `${environment.apiUrl}/account/request-password-reset/`,
      { email: email }
    );
  }

  public resetPassword(newPassword: string, token: string) {
    return this.http.post(
      `${environment.apiUrl}/account/reset-password/${token}/`,
      {
        password: newPassword,
      }
    );
  }

  public addPushSubscription(sub: PushSubscription) {
    let pushJSON = sub.toJSON();
    let wpDevice: WebPushDevice;
    wpDevice = {
      registrationId: pushJSON.endpoint.split("/").slice(-1).pop(),
      p256dh: pushJSON.keys.p256dh,
      auth: pushJSON.keys.auth,
      browser: this.browser.toUpperCase()
    };
    return this.http.post<WebPushDevice>(`${environment.apiUrl}/notify/pushdevice/wp/`, wpDevice);
  }
}
