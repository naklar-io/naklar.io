import {
  Resolve,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Constants } from "../_models";
import { Injectable, Inject, PLATFORM_ID } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Observable, of, EMPTY } from "rxjs";
import { take, mergeMap, tap } from "rxjs/operators";
import { makeStateKey, TransferState } from "@angular/platform-browser";
import { isPlatformServer } from "@angular/common";

@Injectable({
  providedIn: "root",
})
export class DatabaseResolverService implements Resolve<Constants> {
  constructor(
    private databaseService: DatabaseService,
    @Inject(PLATFORM_ID) private platformID,
    private transferState: TransferState,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Constants> | Observable<never> {
    const CONST_KEY = makeStateKey<Constants>("constants");

    // return constants if in transfer storage
    if (this.transferState.hasKey(CONST_KEY)) {
      const constants = this.transferState.get<Constants>(CONST_KEY, null);
      this.transferState.remove(CONST_KEY);
      return of(constants);
    }
    return this.databaseService
      .getConstants()
      .pipe(
        take(1),
        mergeMap((constants) => {
          if (constants) {
            return of(constants);
          } else {
            console.log("Error pre-fetching database Constants");
            return EMPTY;
          }
        })
      )
      .pipe(
        // save constants in transfer storage if rendering server-side
        tap((c) => {
          if (isPlatformServer(this.platformID)) {
            this.transferState.set(CONST_KEY, c);
          }
        })
      );
  }
}
