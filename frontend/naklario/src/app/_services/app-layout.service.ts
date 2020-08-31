import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject } from 'rxjs';

@Injectable()
export class AppLayoutService {

  private scrollable: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  private fullscreen: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  fullscreen$: Observable<boolean> = this.fullscreen.asObservable();
  scrollable$: Observable<boolean> = this.scrollable.asObservable();

  constructor() {
    //this.scrollable$ = this.scrollable.asObservable();
    //this.fullscreen$ = this.fullscreen.asObservable();
  }

  public setScrollable(scrollable: boolean) {
    this.scrollable.next(scrollable);
  }

  public setFullscreen(fullscreen: boolean) {
    this.fullscreen.next(fullscreen);
  }

  public get isScrollable(): boolean {
    return this.scrollable.value;
  }

  public get isFullscreen(): boolean {
    return this.fullscreen.value;
  }
}
