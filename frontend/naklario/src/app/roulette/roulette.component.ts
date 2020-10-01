import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import {
  RouletteService,
  AuthenticationService,
  BannerService,
} from '../_services';
import {
  Match,
  JoinResponse,
  Meeting,
  StudentRequest,
  Constants,
  Request,
} from '../_models';
import { map, tap, take, switchMap } from 'rxjs/operators';
import { Observable } from 'rxjs';

// roulette state machine
type State = 'create' | 'wait' | 'waitsession' | 'session' | 'feedback';
type UserType = 'student' | 'tutor';

@Component({
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.scss'],
})
export class RouletteComponent implements OnInit, OnDestroy {
  // type === 'student' => invoke student component
  // type === 'tutor'=> invoke tutor component
  type: UserType;
  state: State;
  join: JoinResponse;
  meeting: Meeting;
  request: Request;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rouletteService: RouletteService,
    private authenticationService: AuthenticationService,
    private bannerService: BannerService
  ) {
    // this.bannerService.showBanner();
  }
  ngOnInit(): void {
    if (this.router.url.includes('student')) {
      this.type = 'student';
    } else if (this.router.url.includes('tutor')) {
      this.type = 'tutor';
    } else {
      this.type = 'student';
    }

    this.route.queryParams.subscribe((params) => {
      if (params.state === 'session') {
        if (this.join) {
          this.state = 'session';
        } else if (params.meetingId) {
          this.state = 'waitsession';
          this.rouletteService
            .joinMeetingById(params.meetingId)
            .subscribe((join) => {
              this.join = join;
              this.state = 'session';
            });
        }
      } else if
        (params.state === 'wait' && !this.request) {
        this.rouletteService.getRequest(this.type).subscribe(
          (request) => {
            this.request = request;
            this.state = 'wait';
          },
          (error) => {
            this.router.navigateByUrl('/');
          }
        );
      } else {
        /* this.state =
          params.state && params.state === "wait" ? "wait" : "create";*/
        this.state = params.state ? params.state : 'create';
      }
      if (this.state === 'feedback' && !this.meeting) {
        if (params.meetingId) {
          this.rouletteService.getMeeting(params.meetingId).subscribe(
            (meeting) => {
              this.meeting = meeting;
            },
            (error) => {
              console.error('Meeting wasn\'t found!', error);
              this.router.navigateByUrl('/');
            }
          );
        } else {
          this.router.navigateByUrl('/');
        }
      }
    });


    let constants$: Observable<any> = this.route.data;
    if (this.state === 'create' && this.type === 'tutor') {
      constants$ = this.tutorMatchCreate(constants$);
    }
    constants$.subscribe();
  }

  tutorMatchCreate(obs: Observable<{ constants: Constants }>) {
    return obs
      .pipe(take(1))
      .pipe(
        switchMap((data) => {
          // TODO: is this valid?
          const subj = this.authenticationService.currentUserValue.tutordata
            .subjects[0].id;
          return this.rouletteService.createRequest(
            'tutor',
            new StudentRequest(subj),
            data.constants
          );
        })
      )
      .pipe(tap((request) => {
        this.request = request;
        this.router.navigate([], {
          relativeTo: this.route,
          queryParams: { state: 'wait' }
        });
        this.state = 'wait';
      }));
  }

  onCreateDone(request: Request) {
    if (request) {
      // advance state
      this.request = request;
      this.state = 'wait';

    }
  }

  onWaitDone(response: JoinResponse) {
    if (response) {
      // accepted match
      this.join = response;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { state: 'session', meetingId: this.join.meetingId },
      });
      this.state = 'session';
    } else {
      // rejected match
      this.router.navigate(['/dashboard']);
    }
  }

  onSessionDone(meeting: Meeting) {
    if (meeting) {
      this.meeting = meeting;
      this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { state: 'feedback', meetingId: this.meeting.meetingId },
      });
      this.state = 'feedback';
    } else {
      this.router.navigate(['/dashboard']);
    }
  }

  onFeedbackDone(done: boolean) {
    if (done) {
      this.router.navigate(['/dashboard']);
    }
  }

  // cleanup
  ngOnDestroy(): void {
    this.rouletteService.deleteRequest(this.type);
    // this.bannerService.hideBanner();
  }
}
