import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Email } from '../_models';
import { ConfigService } from './config.service';
import { ApiService } from './database/api.service';

@Injectable()
export class UnauthenticatedService {
  constructor(private api: ApiService) {}

  submitEmailAddress(form: Email) {
    return this.api.post<Email, Email>(
      `/landing/add_individual/`,
      form
    );
  }
}
