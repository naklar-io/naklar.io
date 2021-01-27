import { Injectable } from '@angular/core';
import { AuthenticationService } from '../_services';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ConfigService } from '../_services/config.service';
import { finalize, map, switchMap, tap } from 'rxjs/operators';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(
        private authenticationService: AuthenticationService,
        private settings: ConfigService
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return this.settings.apiURL.pipe(
            map((url) => {
                const apiUrl = new URL(url);
                const targetUrl = new URL(request.url);
                if (targetUrl.origin === apiUrl.origin) {
                    const currentUser = this.authenticationService.currentUserValue;
                    if (currentUser && currentUser.token) {
                        request = request.clone({
                            setHeaders: {
                                Authorization: `Token ${currentUser.token}`,
                            },
                        });
                    }
                }
                return request;
            }),
            switchMap((request) => next.handle(request))
        );
    }
}
