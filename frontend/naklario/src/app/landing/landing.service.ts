import { Injectable } from "@angular/core";
import { HttpClient, HttpErrorResponse } from "@angular/common/http";

import { Observable, throwError } from "rxjs";
import { catchError, retry } from "rxjs/operators";
export interface EmailForm {
  type: string;
  email: string;
  updates: boolean;
}

@Injectable()
export class LandingService {
  private backendUrl = "api.naklar.io";

  constructor(private http: HttpClient) {}

  postForm(form: EmailForm): Observable<EmailForm> {
    return this.http
      .post<EmailForm>(this.backendUrl, form)
      .pipe(retry(3), catchError(this.handleError));
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // client side error
      console.log("An error occurred: " + error.error.message);
    } else {
      // the backend returned an error
      // response should contain what is wrong
      console.error(
        `Backend returned code ${error.status} body was: ${error.error}`
      );
    }
    // user facing error message
    return throwError(
      "Ups, das hätte nicht passieren sollen. Probier es später noch einmal:"
    );
  }
}
