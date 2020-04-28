import { Injectable } from "@angular/core";
import { Resolve, ActivatedRouteSnapshot } from "@angular/router";
import { Observable, of } from "rxjs";
import { User, Constants } from "../_models";
import { AuthenticationService } from "./authentication.service";
import { first, map, mergeMap } from "rxjs/operators";
import { DatabaseService } from "./database.service";

@Injectable({ providedIn: "root" })
export class UserResolver implements Resolve<User> {
  constructor(
    private authenticationService: AuthenticationService,
    private databaseService: DatabaseService
  ) {
    this.constants$ = databaseService.getConstants();
    this.lastRefresh = Date.now();
    console.log(this.lastRefresh);
  }

  constants$: Observable<Constants>;
  lastRefresh: number = -1;
  interval = 60 * 1000;

  resolve(route: ActivatedRouteSnapshot): Observable<User> | User {
    if (
      this.authenticationService.currentUserValue?.firstName == ""|| 
      Date.now() - this.lastRefresh > this.interval
    ) {
      console.log("refreshing");
      this.lastRefresh = Date.now();
      return this.constants$.pipe(
        first(),
        mergeMap((constants) => {
          return this.authenticationService
            .fetchUserData(constants)
            .pipe(first(), (user) => {
              console.log(user);
              return user;
            });
        })
      );
    } else {
      return this.authenticationService.currentUserValue;
    }
  }
}
