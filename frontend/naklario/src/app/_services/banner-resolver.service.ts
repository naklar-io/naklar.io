import {
  Resolve,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from "@angular/router";
import { Injectable } from "@angular/core";
import { Observable, of } from "rxjs";

export interface BannerData {
  display: boolean;
}

@Injectable({
  providedIn: "root",
})
export class BannerResolverService implements Resolve<BannerData> {
  constructor(private router: Router) {}

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<BannerData> {
    return of({ display: true });
  }
}
