import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, throwError, Subject, of } from "rxjs";
import { catchError, retry } from "rxjs/operators";

import { environment } from "../../../environments/environment";

import { EmailModel } from "./email-model";

@Injectable()
export class EmailFormService {
  constructor(private http: HttpClient) {}

  readonly emailTaken = new Subject<boolean>();

  postForm(form: EmailModel): Observable<EmailModel> {
    let requestUrl = environment.apiUrl + "/landing/add_individual/";

    return this.http.post<EmailModel>(requestUrl, form).pipe(
      catchError(error => {
        console.error("An error occurred: ", error.error);
        this.emailTaken.next(true);
        return throwError(error.error)
      })
    );
  }
}
