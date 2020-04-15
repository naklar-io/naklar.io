import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  Input,
} from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Match, Constants } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { tap, switchMap } from "rxjs/operators";
import { Subscribable, Subscription } from "rxjs";

type State = "wait" | "maybe" | "accepted";

@Component({
  selector: "roulette-wait",
  templateUrl: "./wait.component.html",
  styleUrls: ["./wait.component.scss"],
})
export class WaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;
  @Output() done = new EventEmitter<boolean>();

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
          // Listen for rejected matches
          if (!data && (this.state == "maybe" || this.state == "accepted")) {
            this.state = "wait";
            this.match = null;
            return;
          }
          if (data) {
            this.match = data;
            this.state = this.state === "wait" ? "maybe" : this.state;
            if (this.match.bothAccepted()) {
              this.done.emit(true);
            }
          }
        },
        (error) => {
          console.log("error", error);
        }
      );
  }
  ngOnDestroy(): void {
    if (!(this.match && this.match.bothAccepted)) {
      this.rouletteService.deleteMatch(this.requestType);
    }
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
