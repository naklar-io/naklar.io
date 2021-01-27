import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import {
    User,
    SendableUser,
    SendableLogin,
    sendableToLocalUser,
    Constants,
    TutorData,
} from '../_models';
import { map, tap, mergeMap, switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { ApiService } from './database/api.service';
import { ConfigService } from './config.service';

interface LoginResponse {
    token: string;
    expiry: string;
}

export type AccountType = 'student' | 'tutor' | 'both';

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
    public currentUser: Observable<User>;

    private currentUserSubject: BehaviorSubject<User>;
    private loggedIn: BehaviorSubject<boolean>;
    private loggedIn$: Observable<boolean>;

    constructor(
        @Inject(PLATFORM_ID) platformId,
        private api: ApiService,
        private http: HttpClient,
        private config: ConfigService
    ) {
        let user: User;
        // Only use localStorage in Browser
        if (isPlatformBrowser(platformId)) {
            user = JSON.parse(localStorage.getItem('currentUser')) as User;
        }
        let loggedIn = false;
        // is the login still valid ?
        if (
            user &&
            user.token &&
            (!user.tokenExpiry || Date.parse(user.tokenExpiry) > Date.now())
        ) {
            console.log('loaded logged in user from local storage');
            loggedIn = true;
        } else {
            user = new User('', '', '', '', null, null, null, false, false, null, '', '');
            loggedIn = false;
            console.log('no user found in localstorage');
        }

        this.loggedIn = new BehaviorSubject<boolean>(loggedIn);
        this.loggedIn$ = this.loggedIn.asObservable();

        this.currentUserSubject = new BehaviorSubject<User>(user);
        this.currentUser = this.currentUserSubject.asObservable();
        // automatically update User in localStorage on change
        // only if in browser
        if (isPlatformBrowser(platformId)) {
            this.currentUser.subscribe((sendableUser) =>
                localStorage.setItem('currentUser', JSON.stringify(sendableUser))
            );
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
                    return 'both';
                } else if (s.tutordata) {
                    return 'tutor';
                } else {
                    return 'student';
                }
            })
        );
    }

    public updateUser(user: Partial<SendableUser>, constants: Constants) {
        return this.api.patch<SendableUser, SendableUser>(`/account/current/`, user).pipe(
            map((sendableUser) => {
                const u = sendableToLocalUser(sendableUser, constants);
                // replace tokens
                const newUser = Object.assign(u, {
                    token: this.currentUserValue.token,
                    tokenExpiry: this.currentUserValue.tokenExpiry,
                });
                this.currentUserSubject.next(newUser);
                return sendableUser;
            })
        );
    }

    public register(user: SendableUser, constants: Constants) {
        return this.api.post<SendableUser, SendableUser>(`/account/create/`, user).pipe(
            map((sendableUser) => {
                // this.currentUserSubject.next(u);
                return sendableUser;
            })
        );
    }

    public login(login: SendableLogin, constants: Constants) {
        return this.config.apiURL.pipe(
            switchMap((url) => {
                return this.http
                    .post<LoginResponse>(
                        `${url}/account/login/`,
                        {},
                        {
                            headers: new HttpHeaders({
                                Authorization: 'Basic ' + btoa(`${login.email}:${login.password}`),
                            }),
                        }
                    )
                    .pipe(
                        map((response) => {
                            console.log('Got Login response:', response);
                            const user = new User(
                                '',
                                '',
                                '',
                                '',
                                null,
                                null,
                                null,
                                false,
                                false,
                                null,
                                '',
                                ''
                            );
                            user.token = response.token;
                            user.tokenExpiry = response.expiry;
                            this.currentUserSubject.next(user);
                            this.loggedIn.next(true);
                            return response;
                        })
                    )
                    .pipe(
                        mergeMap(() => {
                            const user$ = this.fetchUserData(constants);
                            user$.subscribe();
                            console.log('Logged in user:', this.currentUserValue);
                            return user$;
                        })
                    );
            })
        );
    }

    public fetchUserData(constants: Constants) {
        if (this.isLoggedIn) {
            return this.api.get<SendableUser>(`/account/current/`).pipe(
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
        return this.api.get<SendableUser>(`/account/current/`).pipe(
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
            this.api.post(`/account/logout/`, null).subscribe();
            this.currentUserSubject.next(null);
            this.loggedIn.next(false);
        }
    }

    /**
     * logout all devices (invalidates all user tokens)
     */
    public logoutAll() {
        this.api.post(`/account/logoutall/`, null).subscribe();
        this.currentUserSubject.next(null);
        this.loggedIn.next(false);
    }

    public verify(token: string) {
        return this.api.post(`/account/email/verify/${token}/`, null).pipe(
            tap(() => {
                // set verified to true
                this.currentUserValue.emailVerified = true;
                this.currentUserSubject.next(this.currentUserValue);
            })
        );
    }

    public resendVerify() {
        return this.api.post(`/account/email/resend_verification/`, null);
    }

    public requestPasswordReset(email: string) {
        return this.api.post(`/account/request-password-reset/`, { email });
    }

    public resetPassword(newPassword: string, token: string) {
        return this.api.post(`/account/reset-password/${token}/`, {
            password: newPassword,
        });
    }

    public deleteAccount() {
        this.api.delete(`/account/current/`).subscribe();
        this.currentUserSubject.next(null);
        this.loggedIn.next(false);
    }
}
