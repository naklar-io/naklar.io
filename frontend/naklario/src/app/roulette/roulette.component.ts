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
  type: UserType = "student";

  state: State = "create";

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private rouletteService: RouletteService
  ) {}
  ngOnInit(): void {
    if (this.router.url.endsWith("student")) {
      this.type = "student";
    } else if (this.router.url.endsWith("tutor")) {
      this.type = "tutor";
    } else {
      this.type = "student";
    }
  }

  onCreateDone(done: boolean) {
    if (done) {
      // advance state
      this.state = "wait";
    }
  }

  onWaitDone(done: boolean) {
    if (done) {
      // advance state
      this.state = "match";
    }
  }

  onMatchDone(done: boolean) {
    if (done) {
      // advance state
      this.state = "session";
    }
  }

  onSessionDone(done: boolean) {
    // TODO pass router params for correct feedback
    this.router.navigate(["roulette/feedback"]);
  }

  // cleanup
  ngOnDestroy(): void {}
}
