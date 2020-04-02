import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { environment } from "../../environments/environment";
import { Email } from "../_models";

@Injectable()
export class UnauthenticatedService {
  constructor(private http: HttpClient) {}

  submitEmailAddress(form: Email) {
    return this.http.post<Email>(
      `${environment.apiUrl}/landing/add_individual/`,
      form
    );
  }
}
