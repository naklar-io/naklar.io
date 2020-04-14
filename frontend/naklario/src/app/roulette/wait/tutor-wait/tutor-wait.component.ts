import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
} from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Match, Constants } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { tap, switchMap } from "rxjs/operators";
import { Subscribable, Subscription } from "rxjs";

type State = "wait" | "maybe" | "accepted";

@Component({
  selector: "roulette-tutor-wait",
  templateUrl: "./tutor-wait.component.html",
  styleUrls: ["./tutor-wait.component.scss"],
})
export class TutorWaitComponent implements OnInit, OnDestroy {
  @Output() done = new EventEmitter<boolean>();
  private readonly requestType: RouletteRequestType = "tutor";

  match: Match;
  constants: Constants;
  state: State;

  sub$: Subscription;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService
  ) {}

  get student() {
    return this.match.student;
  }

  ngOnInit(): void {
    this.state = "wait";
    this.sub$ = this.route.data
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
          this.match = data;
          this.state = this.state === "wait" ? "maybe" : this.state;
          if (this.match.bothAccepted()) {
            this.done.emit(true);
          }
        },
        (error) => {
          console.log("error", error);
        }
      );
  }
  ngOnDestroy(): void {
    this.rouletteService.deleteMatch(this.requestType);
    this.sub$.unsubscribe();
  }

  onMatchAccepted(agree: boolean) {
    this.rouletteService.answerMatch(this.requestType, this.match, {
      agree: agree,
    });
    if (agree) {
      this.state = "accepted";
    } else {
      this.done.emit(false);
    }
  }
}
