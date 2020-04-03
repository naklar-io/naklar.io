import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { ActivatedRoute, Router, ParamMap } from "@angular/router";
import { switchMap } from "rxjs/operators";
import { Observable, Subscription } from "rxjs";

@Component({
  selector: "app-roulette",
  templateUrl: "./roulette.component.html",
  styleUrls: ["./roulette.component.scss"]
})
export class RouletteComponent implements OnInit, OnDestroy {
  // type === 'student' => invoke student component
  // type === 'tutor'=> invoke tutor component
  type: string;
  private type$: Subscription;

  constructor(private route: ActivatedRoute, private router: Router) {}

  ngOnInit(): void {
    this.type$ = this.route.paramMap
      .pipe(switchMap((params: ParamMap) => params.getAll("type")))
      .subscribe(v => {
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
