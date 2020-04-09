import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import {
  User,
  SendableUser,
  SendableLogin,
  sendableToLocal,
  Constants,
  State,
} from "../_models";
import { environment } from "../../environments/environment";
import { map, flatMap, tap } from "rxjs/operators";

interface LoginResponse {
  token: string;
  expiry: string;
}

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  public currentUser: Observable<User>;

  private currentUserSubject: BehaviorSubject<User>;
  private loggedIn: BehaviorSubject<boolean>;
  private loggedIn$: Observable<boolean>;

  constructor(private http: HttpClient) {
    let user = JSON.parse(localStorage.getItem("currentUser")) as User;
    let loggedIn = false;
    // is the login still valid ?
    if (user && user.token && Date.parse(user.token_expiry) > Date.now()) {
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
    this.currentUser.subscribe((user) =>
      localStorage.setItem("currentUser", JSON.stringify(user))
    );
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

  public updateUser(user: SendableUser, constants: Constants) {
    if (!user.password) {
      // don't send password if it wasn't updated
      delete user.password;
    }
    return this.http
      .put<SendableUser>(`${environment.apiUrl}/account/`, user)
      .pipe(
        map((user) => {
          const u = sendableToLocal(user, constants);
          // replace tokens
          const newUser = Object.assign(u, {
            token: this.currentUserValue.token,
            token_expiry: this.currentUserValue.token_expiry,
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
          const u = sendableToLocal(user, constants);
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
          user.token_expiry = response.expiry;
          this.currentUserSubject.next(user);
          this.loggedIn.next(true);
          return response;
        })
      )
      .pipe(
        flatMap(() => {
          const user$ = this.fetchUserData(constants);
          console.log("Logged in user:", this.currentUserValue);
          return user$;
        })
      );
  }

  private fetchUserData(constants: Constants) {
    return this.http
      .get<SendableUser>(`${environment.apiUrl}/account/current/`)
      .pipe(
        map((user) => {
          const u = sendableToLocal(user, constants);
          const filledUser = Object.assign(u, {
            token: this.currentUserValue.token,
            token_expiry: this.currentUserValue.token_expiry,
          }) as User;
          this.currentUserSubject.next(filledUser);
          return filledUser;
        })
      );
  }

  /**
   * logout current user
   */
  public logout() {
    this.http.post(`${environment.apiUrl}/account/logout/`, null);
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
  }

  /**
   * logout all devices (invalidates all user tokens)
   */
  public logoutAll() {
    this.http.post(`${environment.apiUrl}/account/logoutall/`, null);
    this.currentUserSubject.next(null);
    this.loggedIn.next(false);
  }

  public verify(token: string) {
    return this.http
      .post<null>(`${environment.apiUrl}/account/email/verify/${token}/`, null)
      .pipe(
        tap((v) => {
          // set verified to true
          this.currentUserValue.email_verified = true;
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
}
