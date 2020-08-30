import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ScrollableService {

  private scrollable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  scrollable$: Observable<boolean>;

  constructor() {
    this.scrollable$ = this.scrollable.asObservable();
  }

  public setScrollable(scrollable: boolean) {
    this.scrollable.next(scrollable);
  }

  public get isScrollable(): boolean {
    return this.scrollable.value;
  }
}
