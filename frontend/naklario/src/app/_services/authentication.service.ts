import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import { User, SendableUser, SendableLogin, sendableToLocal } from "../_models";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

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

  public register(user: SendableUser) {
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

  public login(login: SendableLogin) {
    return this.http
      .post<SendableLogin>(`${environment.apiUrl}/account/login/`, login)
      .pipe(
        map(response => {
          console.log(response);
          const user = this.currentUserSubject.value;
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
