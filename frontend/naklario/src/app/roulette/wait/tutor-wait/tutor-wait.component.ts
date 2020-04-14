import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Match, Constants } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { tap, switchMap } from "rxjs/operators";

@Component({
  selector: "roulette-tutor-wait",
  templateUrl: "./tutor-wait.component.html",
  styleUrls: ["./tutor-wait.component.scss"],
})
export class TutorWaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;

  match: Match;

  constants: Constants;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService
  ) {}

  ngOnInit(): void {
    this.match = null;
    this.route.data
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
          console.log("got match request:", data);
        },
        (error) => {
          console.log("error", error);
        }
      );
  }
  ngOnDestroy(): void {
    this.rouletteService.stopUpdatingMatch(this.requestType);
  }
}
