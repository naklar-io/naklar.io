import { Observable } from 'rxjs';

export interface TimestampObservableCache<T> {
  expires: number;
  observable: Observable<T>;
}
