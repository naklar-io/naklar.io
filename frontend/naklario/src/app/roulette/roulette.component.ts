import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { RouletteService } from "../_services";

// roulette state machine
type State = "create" | "wait" | "match" | "session";
type UserType = "student" | "tutor";

@Component({
  selector: "app-roulette",
  templateUrl: "./roulette.component.html",
  styleUrls: ["./roulette.component.scss"],
})
export class RouletteComponent implements OnInit, OnDestroy {
  // type === 'student' => invoke student component
  // type === 'tutor'=> invoke tutor component
  type: UserType;
  private type$: Subscription;

  state: State = "create";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rouletteService: RouletteService
  ) {}

  onCreateDone(done: boolean) {
    // advance state
    this.state = "wait";
  }

  onWaitDone(done: boolean) {
    // advance state
    this.state = "match";
  }

  onMatchDone(done: boolean) {
    // advance state
    this.state = "session";
  }

  onSessionDone(done: boolean) {
    // TODO pass router params for correct feedback
    this.router.navigate(["roulette/feedback"]);
  }

  ngOnInit(): void {
    this.type$ = this.route.paramMap
      .pipe(switchMap((params: ParamMap) => params.getAll("type")))
      .subscribe((v) => {
        switch (v) {
          case "tutor":
            this.type = "tutor";
            break;
          case "student":
          default:
            // if invalid default to student
            this.type = "student";
        }
      });
  }

  // cleanup
  ngOnDestroy(): void {
    this.type$.unsubscribe();
  }
}
