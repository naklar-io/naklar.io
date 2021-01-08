import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, mergeMap, shareReplay } from 'rxjs/operators';
import { sendableToLocalUser, SendableUser, User } from 'src/app/_models';
import { DatabaseService } from '../../database.service';
import { Get } from '../actions';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root'
})
export class UserService implements Get<User, string>{

  private cache: Record<string, Observable<User>>;

  constructor(private api: ApiService, private db: DatabaseService) {
    this.cache = {};
  }
  read(id: string): Observable<User> {
    if (id in this.cache) {
      console.log('caching user', id);
    } else {
      this.cache[id] = this.db.getConstants().pipe(
        mergeMap((constants) => {
          return this.api.get<SendableUser>(`/account/users/${id}/`).pipe(map(
            (sendable) => sendableToLocalUser(sendable, constants)));
          }
      ), shareReplay(1));
    }
    return this.cache[id];
    
  }
}
