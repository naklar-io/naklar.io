import { Injectable } from '@angular/core';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class AvailableSlotService {

  constructor(private api: ApiService) {
    
  }
}
