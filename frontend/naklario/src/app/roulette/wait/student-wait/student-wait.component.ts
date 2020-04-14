import {
  Component,
  OnInit,
  Input,
  OnDestroy,
  EventEmitter,
  Output,
} from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Constants, Match } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { tap, switchMap } from "rxjs/operators";
import { Subscription } from "rxjs";

type State = "wait" | "maybe" | "accepted";

@Component({
  selector: "roulette-student-wait",
  templateUrl: "./student-wait.component.html",
  styleUrls: ["./student-wait.component.scss"],
})
export class StudentWaitComponent implements OnInit, OnDestroy {
  @Output() done = new EventEmitter<boolean>();
  private readonly requestType: RouletteRequestType = "student";

  match: Match;
  constants: Constants;
  state: State;

  sub$: Subscription;

  constructor(
    private rouletteService: RouletteService,
    private route: ActivatedRoute
  ) {}

  get tutor() {
    return this.match.tutor;
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
