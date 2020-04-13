import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { interval, timer, Observable, BehaviorSubject } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";
import { Match, MatchRequest } from "src/app/_models";

@Component({
  selector: "roulette-waiting",
  templateUrl: "./waiting.component.html",
  styleUrls: ["./waiting.component.scss"],
})
export class WaitingComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;

  match: Match;

  constructor(private rouletteService: RouletteService) {}

  ngOnInit(): void {
    this.rouletteService.updatingMatch(this.requestType).subscribe(
      (data) => {
        console.log("got match:", data);
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
