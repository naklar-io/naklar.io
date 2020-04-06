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
import { map } from "rxjs/operators";

interface LoginResponse {
  token: string;
  expiry: string;
}

@Injectable({ providedIn: "root" })
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<User>;

  public currentUser: Observable<User>;

  constructor(private http: HttpClient) {
    this.currentUserSubject = new BehaviorSubject<User>(new User());
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue() {
    return this.currentUserSubject.value;
  }

  public register(user: SendableUser): Observable<SendableUser> {
    return this.http
      .post<SendableUser>(`${environment.apiUrl}/account/create/`, user)
      .pipe(
        map(user => {
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
            Authorization: "Basic " + btoa(`${login.email}:${login.password}`)
          })
        }
      )
      .pipe(
        map(response => {
          console.log("login response:", response);
          const newUser = Object.assign(this.currentUserSubject.value, {
            token: response.token,
            expiry: new Date(response.expiry)
          });
          this.currentUserSubject.next(newUser);
          return response;
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
