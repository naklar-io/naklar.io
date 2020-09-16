import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input, ChangeDetectorRef
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
import { LoaderType } from 'src/app/_misc_components/spinner-loader/spinner-loader.component';

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
  notificationPermission: NotificationPermission = 'default';

  loader: LoaderType = this.randomLoader();
  // notificationPermissionRequested = false;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService,
    private ts: ToastService,
    private authenticationService: AuthenticationService,
    private cd: ChangeDetectorRef
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
                this.showMatchNotification();
              }
              if (this.state === 'maybe') {
                if (this.requestType === 'tutor' && this.match?.tutorAgree) {
                  this.state = 'accepted';
                } else if (this.requestType === 'student' && this.match?.studentAgree) {
                  this.state = 'accepted';
                } else if (this.match.bothAccepted()) {
                  this.state = 'accepted';
                }
              }
            }
          }
        },
        (error) => {
          this.ts.error(error);
        }
      );
  }

  /**
   * Shows match notification if permission was granted and notifications are supported
   */
  showMatchNotification(): void {
    if (this.notificationSupported && Notification.permission === 'granted') {
      const n = new Notification('Wir haben einen Match für dich gefunden!', {
        icon: `${window.location.origin}/assets/icons/icon-128x128.png`
      });
      n.addEventListener('click', () => {
        parent.focus();
        window.focus();
        n.close();
      });
    }
  }

  askNotificationPermission() {
    const handlePermission = (permission: NotificationPermission) => {
      console.log('response', permission);
      this.notificationPermission = permission;
      this.cd.detectChanges();
    };
    if (this.notificationSupported) {
      if (window.navigator.userAgent.toLowerCase().includes('safari')) {
        // Avoid double requests in safari
        console.log('doing it safari style');
        Notification.requestPermission((permission) => handlePermission(permission));
      } else {
        try {
          Notification.requestPermission().then((permission) => handlePermission(permission));
        } catch (error) {
          if (error instanceof TypeError) {
            Notification.requestPermission((permission) => handlePermission(permission));
          } else {
            throw error;
          }
        }
      }
      /*       if (this.checkNotificationPromise()) {
              Notification.requestPermission().then((permission) => {
                handlePermission(permission);
              });
            } else {
              Notification.requestPermission((permission) => {
                handlePermission(permission);
              });
            } */
    }
  }

  private checkNotificationPromise(): boolean {
    try {
      Notification.requestPermission().then();
    } catch (e) {
      return false;
    }
    return true;
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

  private randomLoader(): LoaderType {
    const types: LoaderType[] = ['glowing-circle', 'rainbow-circle'];
    return types[Math.floor(Math.random() * types.length)];
  }
}
