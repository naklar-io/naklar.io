import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { BehaviorSubject, Observable, throwError } from "rxjs";
import {
  User,
  SendableUser,
  SendableLogin,
  sendableToLocal,
  localToSendable,
  MatchRequest,
  MatchAnswer,
} from "../_models";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

type RequestType = "student" | "tutor";

@Injectable({ providedIn: "root" })
export class RouletteService {
  constructor(private http: HttpClient) {}

  public createRequest(requestType: RequestType, request: MatchRequest) {
    return this.http
      .post<MatchRequest>(
        `${environment.apiUrl}/roulette/${requestType}/request/create/`,
        request
      )
      .pipe(
        map((matchRequest) => {
          console.log(matchRequest);
          return matchRequest;
        })
      );
  }
  public deleteRequest(requestType: RequestType) {
    return this.http.delete(
      `${environment.apiUrl}/roulette/${requestType}/request/delete/`
    );
  }

  public updateMatch(requestType: RequestType) {
    return this.http
      .get<MatchRequest>(
        `${environment.apiUrl}/roulette/${requestType}/request/`
      )
      .pipe(
        map((matchRequest) => {
          console.log(matchRequest);
          return matchRequest;
        })
      );
  }

  public answerMatch(requestType: RequestType, answer: MatchAnswer) {
    // TODO: get uuid here
    const uuid = "";
    this.http
      .post<MatchAnswer>(
        `${environment.apiUrl}/roulette/${requestType}/match/answer/${uuid}/`,
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
