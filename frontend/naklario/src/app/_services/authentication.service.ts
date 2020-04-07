import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import {
  User,
  SendableUser,
  SendableLogin,
  sendableToLocal,
  localToSendable
} from "../_models";
import { environment } from "../../environments/environment";
import { map, flatMap } from "rxjs/operators";

interface LoginResponse {
  token: string;
  expiry: string;
}

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;

  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(
      JSON.parse(localStorage.getItem("currentUser"))
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): User {
    return this.currentUserSubject.value;
  }

  /**
   * removes current session from storage
   */
  public loggedOut() {}

  public updateUser(user: SendableUser) {
    if (!user.password) {
      // don't send password if it wasn't updated
      delete user.password;
    }
    return this.http
      .put<SendableUser>(`${environment.apiUrl}/account/`, user)
      .pipe(
        map((user) => {
          const u = sendableToLocal(user);
          // replace tokens
          const newUser = Object.assign(u, {
            token: this.currentUserValue.token,
            token_expiry: this.currentUserValue.token_expiry,
          });
          this.currentUserSubject.next(newUser);
          localStorage.setItem("currentUser", JSON.stringify(this.currentUser));
          return user;
        })
      );
  }

  public register(user: SendableUser) {
    return this.http
      .post<SendableUser>(`${environment.apiUrl}/account/create/`, user)
      .pipe(
        map((user) => {
          const u = sendableToLocal(user);
          this.currentUserSubject.next(u);
          return user;
        })
      );
  }

  /**
   *  preform a partial update on the user object 
   * @param user 
   */
  public update(user: Partial<SendableUser>): Observable<SendableUser> {
    return this.http
      .post<Partial<SendableUser>>(
        `${environment.apiUrl}/account/current`,
        user
      )
      .pipe(
        map(newUser => {
          const sendable: SendableUser = Object.assign(
            localToSendable(this.currentUserSubject.value),
            newUser
          );
          const local = sendableToLocal(sendable);
          this.currentUserSubject.next(local);
          return sendable;
        })
      );
  }

  public login(login: SendableLogin) {
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
          let user = new User();
          user.token = response.token;
          user.token_expiry = response.expiry;

          localStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);

          return response;
        })
      )
      .pipe(
        flatMap(() => {
          const user$ = this.fetchUserData();
          console.log("Logged in user:", this.currentUserValue);
          return user$;
        })
      );
  }

  public fetchUserData() {
    return this.http
      .get<SendableUser>(`${environment.apiUrl}/account/current/`)
      .pipe(
        map((user) => {
          const u = sendableToLocal(user);
          const filledUser = Object.assign(u, {
            token: this.currentUserValue.token,
            token_expiry: this.currentUserValue.token_expiry,
          }) as User;

          localStorage.setItem("currentUser", JSON.stringify(filledUser));
          this.currentUserSubject.next(filledUser);
          return filledUser;
        })
      );
  }

  // TODO:
  public logout() {
    this.http.post(`${environment.apiUrl}/account/logout/`, null);
    this.currentUserSubject.next(null);
  }

  public logoutAll() {
    this.http.post(`${environment.apiUrl}/account/logoutall/`, null);
    this.currentUserSubject.next(null);
  }
}
