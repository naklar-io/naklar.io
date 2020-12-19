import { Injectable } from '@angular/core';
import { formatISO, parseISO } from 'date-fns';
import { Observable } from 'rxjs';
import { Deserializable, Sendable, Serializable, User } from 'src/app/_models';
import { Appointment } from 'src/app/_models/scheduling';
import { DatabaseService } from '../database.service';
import { UserService } from './account/user.service';
import { deserializeDuration, serializeDuration } from './scheduling/utils';

@Injectable({
  providedIn: 'root'
})
export class TransformationService {
  
  

  constructor(private users: UserService, private db: DatabaseService) {}

  toLocal(target: Deserializable, object: Sendable<Deserializable>): Observable<Deserializable> {
    return target.deserialize(object, this);
  }
  
  deserializeAppointment(app: Sendable<Appointment>) {
    const target = new Appointment();
    return target.deserialize(app, this);
  }


  toSendable(object: Serializable) {
    return object.serialize(this);
  }

  deserializeSubject(subjectID: string) {
    return this.db.getSubject(subjectID);
  }

  deserializeUser(user: string) {
    return this.users.read(user);
  }

  deserializeDate(date: string): Date{
    return parseISO(date);
  }

  serializeDate(date: Date): string {
    return formatISO(date);
  }

  deserializeDuration(duration: string): Duration {
    return deserializeDuration(duration);
  }

  serializeDuration(duration: Duration): string {
    return serializeDuration(duration);
  }

}
