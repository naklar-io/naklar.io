import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  SendableMatchAnswer,
  Constants,
  Request,
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
  Report,
  RouletteEvent,
  sendableToLocalMatch, Subject
} from '../_models';
import { environment } from '../../environments/environment';
import {
  map,
  filter,
  tap,
  publishReplay,
} from 'rxjs/operators';
import {
  BehaviorSubject,
  Observable,
  ConnectableObservable,
} from 'rxjs';
import {
  WebSocketSubject, webSocket
} from 'rxjs/webSocket';
import { AuthenticationService } from './authentication.service';
import { ConfigService } from './config.service';
import { ApiService } from './database/api.service';

export type RouletteRequestType = 'student' | 'tutor';

@Injectable({ providedIn: 'root' })
export class RouletteService {
  private matchRequestSubject: BehaviorSubject<Request>;
  private isUpdating = false;

  public matchRequest$: Observable<Request>;
  private socketSubject: WebSocketSubject<RouletteEvent>;
  private lastMatch = null;
  private lastMeetingID = null;
  private apiURL;

  constructor(
    private api: ApiService,
    private auth: AuthenticationService,
    private config: ConfigService
  ) {
    this.matchRequestSubject = new BehaviorSubject<Request>(null);
    this.matchRequest$ = this.matchRequestSubject
      .asObservable()
      // filter the first null value
      .pipe(filter((x) => Boolean(x)));
    this.config.apiURL.subscribe(x => this.apiURL = x);
  }
  public get matchRequestValue() {
    return this.matchRequestSubject.value;
  }

  public createRequest(
    requestType: RouletteRequestType,
    request: StudentRequest,
    constants: Constants,
  ): Observable<StudentRequest> {
    return this.api
      .post<SendableStudentRequest, SendableStudentRequest>(
        `/roulette/${requestType}/request/`,
        localToSendableStudentRequest(request)
      )
      .pipe(map((r) => sendableToLocalStudentRequest(r, constants)))
      .pipe(
        tap((matchRequest) => {
          console.log('got Match request: ', matchRequest);
          this.matchRequestSubject.next(matchRequest);
        })
      );
  }

  public socketMatch(requestType: RouletteRequestType, requestID: number, constants: Constants): Observable<Match> {

    const apiURL = new URL(this.apiURL);
    const protocol = apiURL.protocol === 'https:' ? 'wss:' : 'ws:';
    // setting apiURL to be the right protocol
    apiURL.protocol = protocol;
    let baseURL = apiURL.origin + apiURL.pathname;
    // make sure that the baseURL ends with a /
    if (!baseURL.endsWith('/')) {
      baseURL += '/';
    }
    const wsURL = `${baseURL}roulette/request/${requestType}/${requestID}?token=${this.auth.currentUserValue.token}`;
    console.log('ws-base-url', apiURL);
    this.socketSubject = webSocket<RouletteEvent>(wsURL);
    return this.socketSubject.asObservable().pipe(filter((event) => {
      if (event.event === 'meetingReady' && !this.lastMatch) {
        this.lastMeetingID = event.meetingID;
        return false;
      }
      return true;
    })).pipe(map((event) => {
      if (event.event === 'matchDelete') {
        return null;
      } else if (event.event === 'meetingReady') {
        const match = this.lastMatch;
        this.lastMeetingID = event.meetingID;
        match.meetingID = event.meetingID;
        return match;
      } else if (event.match) {
        const match = sendableToLocalMatch(event.match, constants);
        if (this.lastMeetingID) {
          match.meetingID = this.lastMeetingID;
        }
        // Hack: Have to add apiUrl
        if (!match.tutor.tutordata.profilePicture.startsWith('http')) {
          match.tutor.tutordata.profilePicture = this.apiURL + match.tutor.tutordata.profilePicture;
        }
        this.lastMatch = match;
        return match;
      }
    }));
  }

  public updatingMatch(
  ): Observable<Match> {
    if (!this.isUpdating) {
      this.isUpdating = true;
      // (obs as ConnectableObservable<MatchRequest>).connect();
    }
    return (
      this.matchRequest$
        // .pipe(filter((r) => Boolean(r.match)))
        .pipe(map((r) => r.match))
    );
  }

  public stopUpdatingMatch() {
    this.isUpdating = false;
    this.socketSubject?.complete();
  }

  public deleteRequest(requestType: RouletteRequestType): Observable<void> {
    const obs = this.api
      .delete<void>(`/roulette/${requestType}/request/`)
      .pipe(
        tap(() => {
          console.log('deleting match');
          this.matchRequestSubject.next(null);
          this.isUpdating = false;
        }),
        publishReplay()
      );
    // force the call even if no one is subscribed
    (obs as ConnectableObservable<void>).connect();
    return obs;
  }

  public getRequest(requestType: RouletteRequestType): Observable<Request> {
    return this.api.get<Request>(`/roulette/${requestType}/request/`);
  }

  public answerMatch(
    requestType: RouletteRequestType,
    match: Match,
    answer: MatchAnswer
  ): Observable<MatchAnswer> {
    const obs = this.api
      .post<SendableMatchAnswer, SendableMatchAnswer>(
        `/roulette/${requestType}/match/answer/${match.uuid}/`,
        localToSendableMatchAnswer(answer)
      )
      .pipe(map((a) => sendableToLocalMatchAnswer(a)))
      .pipe(tap((a) => console.log('posted match answer', a)))
      .pipe(publishReplay());
    (obs as ConnectableObservable<MatchAnswer>).connect();
    return obs;
  }

  public getMeetings() {
    return this.api
      .get<Meeting[]>(`/roulette/meetings/`)
      .pipe(tap((m) => console.log('got meetings: ', m)));
  }

  public getMeeting(id: string): Observable<Meeting> {
    return this.api
      .get<Meeting>(`/roulette/meetings/${id}`)
      .pipe(tap((m) => console.log('got meeting', m)));
  }

  public joinMeeting(match: Match) {
    return this.api
      .post<JoinResponse, JoinResponse>(
        `/roulette/meeting/join/${match.uuid}/`,
        null
      )
      .pipe(tap((r) => console.log('got join response: ', r)));
  }

  public joinMeetingById(id: string) {
    return this.api
      .post<JoinResponse, JoinResponse>(
        `/roulette/meeting/joinbyid/${id}/`,
        null
      )
      .pipe(tap((r) => console.log('got joinbyid response: ', r)));
  }

  public endMeeting(meeting: Meeting) {
    return this.api
      .post(
        `/roulette/meeting/end/${meeting.meetingId}/`,
        null
      )
      .pipe(tap((_) => console.log('ended meeting')));
  }

  public getFeedbackMeeting(meeting: Meeting) {
    return this.api.get<Feedback>(
      `/roulette/meeting/feedback/${meeting.meetingId}/`
    );
  }

  public postFeedback(feedback: Feedback) {
    return this.api
      .post(`/roulette/meeting/feedback/`, feedback)
      .pipe(tap((f) => console.log('posted feedback', f)));
  }

  public getFeedback() {
    return this.api
      .get<Feedback[]>(`/roulette/meeting/feedback/`)
      .pipe(tap((f) => console.log('got feedback', f)));
  }

  public postReportMeeting(report: Report) {
    return this.api
      .post<Report, Report>(`/roulette/meeting/report/`, report)
      .pipe(tap((r) => console.log('posted report', r)));
  }

  public getOnlineSubjects(): Observable<Subject[]> {
    return this.api.get<Subject[]>(`/roulette/online-subjects/`).pipe(tap((s) => {
      console.log('got subjects', s);
    }));
  }
}
