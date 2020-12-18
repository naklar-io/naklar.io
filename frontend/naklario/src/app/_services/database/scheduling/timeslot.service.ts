import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class TimeslotService {

  constructor(private api: ApiService) {
    
  }
}
