import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Subject as R_Subject, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

import { environment } from "../environments/environment";
import {State, Subject, SchoolData, SchoolType} from './database-models'


@Injectable()
export class GlobalDataService {
  // backend tables
  readonly states = new R_Subject<State[]>();
  readonly subjects = new R_Subject<Subject[]>();
  readonly schooltypes = new R_Subject<SchoolType[]>();
  readonly schooldata = new R_Subject<SchoolData[]>();

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

  setStates(states: State[]): void {
    this.states.next(states);
  }
  setSubjects(subjects: Subject[]): void {
    this.subjects.next(subjects);
  }
  setSchoolTypes(schoolTypes: SchoolType[]): void {
    this.schooltypes.next(schoolTypes);
  }
  setSchoolData(schoolData: SchoolData[]): void {
    this.schooldata.next(schoolData);
  }
}
