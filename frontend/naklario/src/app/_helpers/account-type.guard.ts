import { Injectable } from "@angular/core";

import { AuthenticationService, ToastService } from "../_services";
import {
  CanActivate,
  Router,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  CanActivateChild,
} from "@angular/router";

/**
 * for sites which require a student account
 */
@Injectable({ providedIn: "root" })
export class StudentGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      if (currentUser.studentdata) {
        return true;
      } else {
        this.toastService.error(
          "Du must einen Studenten Account haben, um hier hin zu kommen"
        );
        return false;
      }
    } else {
      this.toastService.info("Bitte logge dich ein");
      this.router.navigate(["account/login/"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}

/**
 * for sites which require a verified tutor account
 */
@Injectable({ providedIn: "root" })
export class TutorGuard implements CanActivate, CanActivateChild {
  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private toastService: ToastService
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const currentUser = this.authenticationService.currentUserValue;
    if (currentUser) {
      if (currentUser.tutordata) {
        if (currentUser.tutordata.verified) {
          return true;
        } else {
          this.toastService.error(
            "Dein Account muss verifiziert sein, um hier hin zu kommen"
          );
          return false;
        }
      } else {
        this.toastService.error(
          "Du must einen Tutor Account haben, um hier hin zu kommen"
        );
        return false;
      }
    } else {
      this.toastService.info("Bitte logge dich ein");
      this.router.navigate(["account/login/"], {
        queryParams: { returnUrl: state.url },
      });
      return false;
    }
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    return this.canActivate(route, state);
  }
}
