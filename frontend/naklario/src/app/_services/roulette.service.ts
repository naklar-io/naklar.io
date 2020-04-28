import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import {
  SendableMatchRequest,
  SendableMatchAnswer,
  Constants,
  MatchRequest,
  sendableToLocalMatchRequest,
  StudentRequest,
  Match,
  MatchAnswer,
  localToSendableMatchAnswer,
  sendableToLocalMatchAnswer,
  SendableStudentRequest,
  localToSendableStudentRequest,
  sendableToLocalStudentRequest,
  Meeting,
  Feedback,
  JoinResponse,
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
        tap((matchRequest) => {
          console.log("got Match request: ", matchRequest);
          this.matchRequestSubject.next(matchRequest);
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
            return this.http.get<SendableMatchRequest>(url, {
              headers: { ignoreLoadingBar: "" },
            });
          })
        ) // do we have a match
        //.pipe(filter((x) => Boolean(x.match)))
        .pipe(map((r) => sendableToLocalMatchRequest(r, constants)))
        // does the MatchRequest have new data?
        .pipe(
          filter((r) => {
            if (!this.matchRequestValue) {
              return true;
            }
            const res = !this.matchRequestValue.equals(r);
            return res;
          })
        )
        .pipe(
          tap((r) => {
            console.log("Found Match: ", r);
            this.matchRequestSubject.next(r);
          })
        )
        // observable is only evaluated on subscription
        //.pipe(publishReplay());
        // TODO: this is a resource leak
        .subscribe(
          (d) => d,
          (error) => console.log(error)
        );
      //(obs as ConnectableObservable<MatchRequest>).connect();
    }
    return (
      this.matchRequest$
        // .pipe(filter((r) => Boolean(r.match)))
        .pipe(map((r) => r.match))
    );
  }

  public stopUpdatingMatch() {
    this.isUpdating = false;
  }

  public deleteMatch(requestType: RouletteRequestType): Observable<void> {
    const obs = this.http
      .delete<void>(`${environment.apiUrl}/roulette/${requestType}/request/`)
      .pipe(
        tap(() => {
          console.log("deleting match");
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
    const obs = this.http
      .post<SendableMatchAnswer>(
        `${environment.apiUrl}/roulette/${requestType}/match/answer/${match.uuid}/`,
        localToSendableMatchAnswer(answer)
      )
      .pipe(map((a) => sendableToLocalMatchAnswer(a)))
      .pipe(tap((a) => console.log("posted match answer", a)))
      .pipe(publishReplay());
    (obs as ConnectableObservable<MatchAnswer>).connect();
    return obs;
  }

  public getMeetings() {
    return this.http
      .get<Meeting[]>(`${environment.apiUrl}/roulette/meetings/`)
      .pipe(tap((m) => console.log("got meetings: ", m)));
  }

  public joinMeeting(match: Match) {
    return this.http
      .post<JoinResponse>(
        `${environment.apiUrl}/roulette/meeting/join/${match.uuid}/`,
        null
      )
      .pipe(tap((r) => console.log("got join response: ", r)));
  }
  
  public endMeeting(meeting: Meeting) {
    return this.http
      .post<void>(
        `${environment.apiUrl}/roulette/meeting/end/${meeting.meetingId}/`,
        null
      )
      .pipe(tap((_) => console.log("ended meeting")));
  }

  public getFeedbackMeeting(meeting: Meeting) {
    return this.http.get<Feedback>(
      `${environment.apiUrl}/roulette/meeting/feedback/${meeting.meetingId}/`
    );
  }

  public postFeedback(feedback: Feedback) {
    return this.http
      .post(`${environment.apiUrl}/roulette/meeting/feedback/`, feedback)
      .pipe(tap((f) => console.log("posted feedback", f)));
  }

  public getFeedback() {
    return this.http
      .get<Feedback[]>(`${environment.apiUrl}/roulette/meeting/feedback/`)
      .pipe(tap((f) => console.log("got feedback", f)));
  }

}
