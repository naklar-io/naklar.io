import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";

import { Observable, throwError} from "rxjs";
import { catchError } from "rxjs/operators";

import { environment } from "../../../../environments/environment";
import { User } from 'src/app/database-models';


@Injectable()
export class TutorRegisterService{
  constructor(private http: HttpClient) {}


  postAccountCreate(user: User): Observable<User> {
    let requestUrl = environment.apiUrl + "/account/create/";

    return this.http.post<User>(requestUrl, user).pipe(
      catchError(error => {
        console.error("An error occurred: ", error.error);
        return throwError(error.error)
      })
    );
  }
}
