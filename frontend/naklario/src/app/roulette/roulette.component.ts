import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";
import { RouletteService } from "../_services";
import { Match, JoinResponse, Meeting } from "../_models";

// roulette state machine
type State = "create" | "wait" | "session" | "feedback";
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
  join: JoinResponse;
  meeting: Meeting;

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

  onWaitDone(response: JoinResponse) {
    if (response) {
      // accepted match
      this.join = response;
      this.state = "session";
    } else {
      // rejected match
      this.state = "create";
    }
  }

  onSessionDone(meeting: Meeting) {
    if (meeting) {
      this.state = "feedback";
      this.meeting = meeting;
    } else {
      this.state = "create";
    }
  }

  onFeedbackDone(done: boolean) {
    if (done) {
      this.router.navigate(["/"]);
    }
  }

  // cleanup
  ngOnDestroy(): void {
    this.rouletteService.deleteMatch(this.type);
  }
}
