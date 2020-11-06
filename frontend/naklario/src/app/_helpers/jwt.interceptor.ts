import { Injectable } from '@angular/core';
import { AuthenticationService } from '../_services';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
  constructor(private authenticationService: AuthenticationService) { }

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const apiUrl = new URL(environment.apiUrl);
    const url = new URL(request.url);
    if (url.origin === apiUrl.origin) {
      const currentUser = this.authenticationService.currentUserValue;
      if (currentUser && currentUser.token) {
        request = request.clone({
          setHeaders: {
            Authorization: `Token ${currentUser.token}`
          }
        });
      }
    }
    return next.handle(request);
  }
}
