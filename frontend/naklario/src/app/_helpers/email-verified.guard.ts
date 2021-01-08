import { Injectable } from '@angular/core';

import { AuthenticationService, ToastService } from '../_services';
import {
    CanActivate,
    Router,
    ActivatedRouteSnapshot,
    RouterStateSnapshot,
    CanActivateChild,
} from '@angular/router';
import { map } from 'rxjs/operators';

/**
 * for sites which require the mail to be verified
 */
@Injectable({ providedIn: 'root' })
export class MailVerifiedGuard implements CanActivate, CanActivateChild {
    constructor(
        private router: Router,
        private authenticationService: AuthenticationService,
        private toastService: ToastService
    ) {}

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.authenticationService.currentUser.pipe(
            map((currentUser) => {
                if (currentUser) {
                    if (currentUser.emailVerified) {
                        return true;
                    } else {
                        this.toastService.error(
                            'Deine E-Mail muss bestätigt sein, um hier hin zu kommen!'
                        );
                        this.router.navigate(['/account']);
                        return false;
                    }
                } else {
                    this.toastService.info('Bitte logge dich ein');
                    this.router.navigate(['/account/login/'], {
                        queryParams: { returnUrl: state.url },
                    });
                    return false;
                }
            })
        );
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        return this.canActivate(route, state);
    }
}
