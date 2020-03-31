import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject as R_Subject, Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { environment } from "../environments/environment";

export class State {
  constructor(
    public id: number,
    public name: string,
    public shortcode: string
  ) {}
}

export class Subject {
  constructor(public id: number, public name: string) {}
}
export class SchoolType {
  constructor(public id: number, public name: string) {}
}

export class SchoolData {
  constructor(
    public id: number,
    public school_type: SchoolType,
    public grade: number
  ) {}
}

@Injectable()
export class GlobalDataService {
  // backend tables
  states = new R_Subject<State[]>();
  subjects = new R_Subject<Subject[]>();
  schooltypes = new R_Subject<SchoolType[]>();
  schooldata = new R_Subject<SchoolData[]>();

  constructor(private http: HttpClient) {
    this.getRequest<State[]>(
      environment.apiUrl + "/account/states/",
      this.states
    );
    this.getRequest<Subject[]>(
      environment.apiUrl + "/account/subjects/",
      this.subjects
    );
    this.getRequest<SchoolType[]>(
      environment.apiUrl + "/account/schooltypes/",
      this.schooltypes
    );
    this.getRequest<SchoolData[]>(
      environment.apiUrl + "/account/schooldata/",
      this.schooldata
    );
  }

  getRequest<T>(url: string, subject: R_Subject<T>): void {
    this.http
      .get<T>(url)
      .pipe(
        catchError(error => {
          console.log("An error occurred: ", error.error);
          return throwError(error.error);
        })
      )
      .subscribe(x => {
        subject.next(x);
      });
  }
}
