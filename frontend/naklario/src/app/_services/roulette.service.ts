import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  SendableMatchRequest,
  SendableMatchAnswer,
  SendableMatch,
  Constants,
  MatchRequest,
  sendableToLocalMatchRequest,
  StudentRequest,
  Match,
  localToSendableMatchRequest,
  MatchAnswer,
  localToSendableMatchAnswer,
  sendableToLocalMatchAnswer,
  SendableStudentRequest,
  localToSendableStudentRequest,
  sendableToLocalStudentRequest,
} from "../_models";
import { environment } from "../../environments/environment";
import {
  map,
  switchMap,
  filter,
  take,
  tap,
  takeWhile,
  publishReplay,
} from "rxjs/operators";
import {
  BehaviorSubject,
  Observable,
  timer,
  ConnectableObservable,
} from "rxjs";

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
    request: StudentRequest,
    constants: Constants
  ): Observable<StudentRequest> {
    return this.http
      .post<SendableStudentRequest>(
        `${environment.apiUrl}/roulette/${requestType}/request/`,
        localToSendableStudentRequest(request)
      )
      .pipe(map((r) => sendableToLocalStudentRequest(r, constants)))
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
    constants: Constants,
    interval: number = 1000
  ): Observable<Match> {
    if (!this.isUpdating) {
      this.isUpdating = true;
      const obs = timer(0, interval)
        // can stop the polling from outside this function
        .pipe(takeWhile((_) => this.isUpdating))
        .pipe(
          switchMap((_) => {
            const url = `${environment.apiUrl}/roulette/${requestType}/request/`;
            console.log("polling ", url);
            return this.http.get<SendableMatchRequest>(url);
          })
        )
        .pipe(filter((x) => Boolean(x.match)))
        .pipe(map((r) => sendableToLocalMatchRequest(r, constants)))
        .pipe(
          tap((r) => {
            console.log("Found Match: ", r);
            this.matchRequestSubject.next(r);
            this.isUpdating = false;
          })
        )
        // complete when match found
        .pipe(take(1))
        // observable is only evaluated on subscription
        .pipe(publishReplay());
      (obs as ConnectableObservable<MatchRequest>).connect();
    }
    return this.matchRequest$
      .pipe(filter((r) => Boolean(r.match)))
      .pipe(map((r) => r.match));
  }

  public deleteMatch(requestType: RouletteRequestType): Observable<void> {
    const obs = this.http
      .delete<void>(`${environment.apiUrl}/roulette/${requestType}/request/`)
      .pipe(
        tap(() => {
          this.matchRequestSubject.next(null);
          this.isUpdating = false;
        }),
        publishReplay()
      );
    // force the call even if no one is subscribed
    (obs as ConnectableObservable<void>).connect();
    return obs;
  }

  public answerMatch(
    requestType: RouletteRequestType,
    match: Match,
    answer: MatchAnswer
  ): Observable<MatchAnswer> {
    return this.http
      .post<SendableMatchAnswer>(
        `${environment.apiUrl}/roulette/${requestType}/match/answer/${match.uuid}/`,
        localToSendableMatchAnswer(answer)
      )
      .pipe(map((a) => sendableToLocalMatchAnswer(a)))
      .pipe(tap((a) => console.log(a)));
  }

  public joinMatch() {}
}
