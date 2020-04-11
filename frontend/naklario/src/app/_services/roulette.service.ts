import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { MatchRequest, MatchAnswer, Match, StudentRequest } from "../_models";
import { environment } from "../../environments/environment";
import { map } from "rxjs/operators";

type RequestType = "student" | "tutor";

@Injectable({ providedIn: "root" })
export class RouletteService {
  constructor(private http: HttpClient) {}

  public createRequest(requestType: RequestType, request: StudentRequest) {
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

  public answerMatch(
    requestType: RequestType,
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
