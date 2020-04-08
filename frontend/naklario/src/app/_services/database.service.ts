import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, throwError, combineLatest } from "rxjs";
import { environment } from "../../environments/environment";
import { catchError, map } from "rxjs/operators";
import { State, Subject, SchoolType, SchoolData, Constants } from "../_models";

@Injectable({ providedIn: "root" })
export class DatabaseService {
  public states: Observable<State[]>;
  public subjects: Observable<Subject[]>;
  public schoolTypes: Observable<SchoolType[]>;
  public schoolData: Observable<SchoolData[]>;

  constructor(private http: HttpClient) {
    this.states = this.get<State[]>("/account/states/");
    this.subjects = this.get<Subject[]>("/account/subjects/");
    this.schoolTypes = this.get<SchoolType[]>("/account/schooltypes/");
    this.schoolData = this.get<SchoolData[]>("/account/schooldata/");
  }

  private get<T>(url: string): Observable<T> {
    return this.http.get<T>(environment.apiUrl + url).pipe(
      catchError((err) => {
        console.log("Database request error: ", err);
        return throwError(err);
      })
    );
  }

  public getConstants() {
    return combineLatest(
      this.states,
      this.subjects,
      this.schoolTypes,
      this.schoolData
    ).pipe(
      map(
        ([states, subjects, schoolTypes, schoolData]) =>
          new Constants(states, subjects, schoolTypes, schoolData)
      )
    );
  }
}
