import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from '@angular/core';
import {
  RouletteService,
  RouletteRequestType,
  ToastService,
  AuthenticationService,
} from 'src/app/_services';
import { Match, Constants, JoinResponse, Request } from 'src/app/_models';
import { ActivatedRoute } from '@angular/router';
import { tap, switchMap } from 'rxjs/operators';
import { Subscription } from 'rxjs';

type State = 'wait' | 'maybe' | 'accepted' | 'meetingready';



@Component({
  selector: 'roulette-wait',
  templateUrl: './wait.component.html',
  styleUrls: ['./wait.component.scss'],
})
export class WaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;
  @Input() request: Request;
  @Output() done = new EventEmitter<JoinResponse>();

  match: Match;
  join: JoinResponse;
  constants: Constants;
  state: State;

  subUpdatingMatch: Subscription;
  subJoinMeeting: Subscription;

  notificationSupported: boolean;
  notificationPermission: NotificationPermission;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService,
    private ts: ToastService,
    private authenticationService: AuthenticationService
  ) { }

  get student() {
    return this.match.student;
  }
  get tutor() {
    return this.match.tutor;
  }

  get user() {
    return this.authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.notificationSupported = 'Notification' in window;
    this.notificationPermission = this.notificationSupported ? Notification.permission : 'denied';
    this.state = 'wait';
    this.subUpdatingMatch = this.route.data
      .pipe(
        tap((data: { constants: Constants }) => {
          this.constants = data.constants;
        })
      )
      .pipe(
        switchMap((_) =>
          // this.rouletteService.updatingMatch(this.requestType, this.constants)
          this.rouletteService.socketMatch(this.requestType, this.request.id, this.constants)
        )
      )
      .subscribe(
        (data) => {
          if (data?.bothAccepted() || this.match?.bothAccepted()) {
            this.match = data;
            if (this.match.meetingID && !this.subJoinMeeting) {
              this.subJoinMeeting = this.rouletteService.joinMeetingById(this.match.meetingID).subscribe((join) => {
                this.join = join;
                // return to parent
                this.done.emit(this.join);
              },
                (error) => this.ts.error(error)
              );
            }
          } else {
            // Listen for rejected matches
            if (!data && (this.state === 'maybe' || this.state === 'accepted')) {
              this.state = 'wait';
              this.ts.info('Die Verbindung wurde abgelehnt.');
              // this.match = null;
              return;
            }
            if (data) {
              this.match = data;
              if (this.state === 'wait') {
                this.state = 'maybe';
                const n = new Notification('Wir haben einen Match für dich gefunden!', {
                  icon: `${window.location.origin}/assets/icons/icon-128x128.png`
                });
                n.addEventListener('click', () => {
                  parent.focus();
                  window.focus();
                  n.close();
                });
              }
              if (this.state === 'maybe' && this.match.bothAccepted()) {
                this.state = 'accepted';
              }
            }
          }
        },
        (error) => {
          this.ts.error(error);
        }
      );
  }

  ngOnDestroy(): void {
    console.log('destroying wait');
    if (!this.match?.bothAccepted()) {
      this.rouletteService.deleteRequest(this.requestType);
    }
    this.rouletteService.stopUpdatingMatch();
    this.subUpdatingMatch?.unsubscribe();
    this.subJoinMeeting?.unsubscribe();
  }

  requestNotificationPermission() {
    Notification.requestPermission().then((value) => this.notificationPermission = value);
  }

  onMatchAccepted(agree: boolean) {
    this.rouletteService.answerMatch(this.requestType, this.match, {
      agree,
    });
    if (agree) {
      this.state = 'accepted';
    } else {
      this.done.emit(null);
    }
  }

  playSound() {
    const audio = new Audio();
    audio.src = '/assets/notification/just-saying.mp3';
    audio.load();
    audio.play();
  }

  onBothAccepted() {
    this.subJoinMeeting = this.rouletteService
      .joinMeeting(this.match)
      .subscribe(
        (data) => {
          this.join = data;
          // return to parent
          this.done.emit(this.join);
        },
        (error) => this.ts.error(error)
      );
  }
}
