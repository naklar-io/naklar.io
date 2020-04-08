import {
  Resolve,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Constants } from "../_models";
import { Injectable } from "@angular/core";
import { DatabaseService } from "./database.service";
import { Observable, of, EMPTY } from "rxjs";
import { take, mergeMap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class DatabaseResolverService implements Resolve<Constants> {
  constructor(
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<Constants> | Observable<never> {
    return this.databaseService.getConstants().pipe(
      take(1),
      mergeMap((constants) => {
        if (constants) {
          return of(constants);
        } else {
          console.log("Error pre-fetching database Constants");
          return EMPTY;
        }
      })
    );
  }
}
