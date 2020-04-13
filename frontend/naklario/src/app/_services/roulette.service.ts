import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatchRequest, MatchAnswer, Match, StudentRequest } from "../_models";
import { environment } from "../../environments/environment";
import { map, switchMap, filter, take, tap, takeWhile } from "rxjs/operators";
import { BehaviorSubject, Observable, timer } from "rxjs";

export type RouletteRequestType = "student" | "tutor";

@Injectable({ providedIn: "root" })
export class RouletteService {
  private matchRequestSubject: BehaviorSubject<MatchRequest>;
  private isUpdating = false;

  public matchRequest$: Observable<MatchRequest>;

  constructor(private http: HttpClient) {
    this.matchRequestSubject = new BehaviorSubject<MatchRequest>(null);
    this.matchRequest$ = this.matchRequestSubject
      .asObservable()
      // filter the first null value
      .pipe(filter((x) => Boolean(x)));
  }
  public get matchRequestValue() {
    return this.matchRequestSubject.value;
  }

  public createMatch(
    requestType: RouletteRequestType,
    request: StudentRequest
  ) {
    return this.http
      .post<MatchRequest>(
        `${environment.apiUrl}/roulette/${requestType}/request/`,
        request
      )
      .pipe(
        map((matchRequest) => {
          console.log(matchRequest);
          this.matchRequestSubject.next(matchRequest);
          return matchRequest;
        })
      );
  }

  public updatingMatch(
    requestType: RouletteRequestType,
    interval: number = 1000
  ): Observable<Match> {
    if (!this.isUpdating) {
      this.isUpdating = true;
      timer(0, interval)
        // can stop the polling from outside this function
        .pipe(takeWhile((_) => this.isUpdating))
        .pipe(
          switchMap((_) =>
            this.http.get<MatchRequest>(
              `${environment.apiUrl}/roulette/${requestType}/request/`
            )
          )
        )
        .pipe(filter((x) => Boolean(x.match)))
        .pipe(
          tap((r) => {
            console.log("Found Match: ", r);
            this.matchRequestSubject.next(r.match);
            this.isUpdating = false;
          })
        )
        // complete when match found
        .pipe(take(1));
    }
    return this.matchRequestSubject
      .pipe(filter((r) => Boolean(r.match)))
      .pipe(map((r) => r.match));
  }

  public stopUpdatingMatch(requestType: RouletteRequestType): Observable<void> {
    return this.http
      .delete<void>(`${environment.apiUrl}/roulette/${requestType}/request/`)
      .pipe(
        tap(() => {
          this.matchRequestSubject.next(null);
          this.isUpdating = false;
        })
      );
  }

  public answerMatch(
    requestType: RouletteRequestType,
    match: Match,
    answer: MatchAnswer
  ) {
    this.http
      .post<MatchAnswer>(
        `${environment.apiUrl}/roulette/${requestType}/match/answer/${match.uuid}/`,
        answer
      )
      .pipe(
        map((matchAnswer) => {
          console.log(matchAnswer);
          return matchAnswer;
        })
      );
  }

  public joinMatch() {}
}
