import { EventEmitter, Injectable, Output } from '@angular/core';

@Injectable()
export class ScrollPositionService {

  onScroll = new EventEmitter<Event>();

  constructor() { }

  public updateScroll(event: Event) {
    this.onScroll.emit(event);
  }

}
