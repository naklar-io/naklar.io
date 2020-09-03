import {
  Component,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription, timer } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { BannerService } from 'src/app/_services';

@Component({
  selector: 'roulette-strudent-instruction-video',
  templateUrl: './instruction-video.component.html',
  styleUrls: ['./instruction-video.component.scss'],
})
export class InstructionVideoComponent implements OnInit, OnDestroy {
  @Output() prevClick: EventEmitter<any> = new EventEmitter<any>();
  @Output() nextClick: EventEmitter<any> = new EventEmitter<any>();

  readonly DEFAULT_SKIP_TIMER_DURATION = 11;

  instructionVideoStartedPlaying = false;
  skipDisabledTimer = this.DEFAULT_SKIP_TIMER_DURATION;
  skipTimerSubscription: Subscription = null;

  constructor(private bannerService: BannerService) {}

  ngOnInit(): void {
    this.bannerService.hideBanner();
    if (this.skipTimerSubscription) {
      this.skipTimerSubscription.unsubscribe();
    }

    this.skipTimerSubscription = timer(1500, 1000)
      .pipe(
        filter(() => this.instructionVideoStartedPlaying),
        take(11)
      )
      .subscribe(() => {
        this.skipDisabledTimer--;
      });
  }

  ngOnDestroy(): void {
    if (this.skipTimerSubscription) {
      this.skipTimerSubscription.unsubscribe();
    }
    this.bannerService.hideBanner();
  }

  onVideoPlaying() {
    this.instructionVideoStartedPlaying = true;
  }

  onVideoError() {
    if (this.skipTimerSubscription) {
      this.skipTimerSubscription.unsubscribe();
    }

    this.skipDisabledTimer = 0;
  }

  onBack() {
    this.prevClick.emit();
  }

  onNext() {
    this.nextClick.emit();
  }
}
