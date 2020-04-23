import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import {
  RouletteService,
  RouletteRequestType,
  ToastService,
  AuthenticationService,
} from "src/app/_services";
import { Match, Constants, Meeting, JoinResponse } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { tap, switchMap, map } from "rxjs/operators";
import { Subscription, combineLatest, of } from "rxjs";

type State = "wait" | "maybe" | "accepted";

@Component({
  selector: "roulette-wait",
  templateUrl: "./wait.component.html",
  styleUrls: ["./wait.component.scss"],
})
export class WaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;
  @Output() done = new EventEmitter<JoinResponse>();

  match: Match;
  join: JoinResponse;
  constants: Constants;
  state: State;

  subUpdatingMatch: Subscription;
  subJoinMeeting: Subscription;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService,
    private ts: ToastService,
    private authenticationService: AuthenticationService
  ) {}

  get student() {
    return this.match.student;
  }
  get tutor() {
    return this.match.tutor;
  }

  get user(){
    return this.authenticationService.currentUserValue;
  }

  ngOnInit(): void {
    this.state = "wait";
    this.subUpdatingMatch = this.route.data
      .pipe(
        tap((data: { constants: Constants }) => {
          this.constants = data.constants;
        })
      )
      .pipe(
        switchMap((_) =>
          this.rouletteService.updatingMatch(this.requestType, this.constants)
        )
      )
      .subscribe(
        (data) => {
          // Listen for rejected matches
          if (!data && (this.state === "maybe" || this.state === "accepted")) {
            this.state = "wait";
            this.match = null;
            return;
          }
          if (data) {
            this.match = data;
            this.state = this.state === "wait" ? "maybe" : this.state;
            if (this.match.bothAccepted()) {
              this.onBothAccepted();
            }
          }
        },
        (error) => {
          this.ts.error(error);
        }
      );
  }
  ngOnDestroy(): void {
    console.log("destroying wait");
    if (!this.match?.bothAccepted()) {
      this.rouletteService.deleteMatch(this.requestType);
    }
    this.rouletteService.stopUpdatingMatch();
    this.subUpdatingMatch?.unsubscribe();
    this.subJoinMeeting?.unsubscribe();
  }

  onMatchAccepted(agree: boolean) {
    this.rouletteService.answerMatch(this.requestType, this.match, {
      agree: agree,
    });
    if (agree) {
      this.state = "accepted";
    } else {
      this.done.emit(null);
    }
  }

  playSound() {
    const audio = new Audio();
    audio.src = "/assets/notification/just-saying.mp3";
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
