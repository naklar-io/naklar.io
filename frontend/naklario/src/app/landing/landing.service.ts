import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Observable, throwError, from } from "rxjs";
import { catchError, retry } from "rxjs/operators";
import { environment } from "../../environments/environment";

export interface EmailForm {
  ind_type: string;
  email: string;
  updates: boolean;
}

@Injectable()
export class LandingService {
  constructor(private http: HttpClient) {}

  postForm(form: EmailForm): Observable<EmailForm> {
    let requestUrl = environment.apiUrl + "/landing/add_individual/";
    return this.http
      .post<EmailForm>(requestUrl, form)
      .pipe(catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // client side error
      console.log("An error occurred: " + error.error.message);
    } else {
      // the backend returned an error
      // response should contain what is wrong
      console.error(
        `Backend returned code ${error.status} body was: `,
        error.error
      );
    }
    // user facing error message
    return throwError(error.error);
  }
}
