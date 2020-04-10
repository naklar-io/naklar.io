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
  }

  constants$: Observable<Constants>;

  resolve(
    route: ActivatedRouteSnapshot
  ): Observable<User> | User {
    return this.constants$.pipe(first(), mergeMap(constants => {
        return this.authenticationService.fetchUserData(constants).pipe(first(), user => {
            return user;
        });
    }));
  }

}
