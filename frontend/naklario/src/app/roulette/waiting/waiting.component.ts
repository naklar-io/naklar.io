import { Component, OnInit, Input } from "@angular/core";
import { RouletteService } from "src/app/_services";
import { interval, timer, Observable, BehaviorSubject } from "rxjs";
import { startWith, switchMap } from "rxjs/operators";
import { Match, MatchRequest } from "src/app/_models";

@Component({
  selector: "app-waiting",
  templateUrl: "./waiting.component.html",
  styleUrls: ["./waiting.component.scss"],
})
export class WaitingComponent implements OnInit {
  @Input() requestType;
  @Input() request: MatchRequest;
  requestSubject: BehaviorSubject<MatchRequest>;

  match: Match;

  constructor(private rouletteService: RouletteService) {
    this.requestSubject.subscribe((request) => this.match = request.match);
  }

  ngOnInit(): void {
    timer(1000)
      .pipe(
        startWith(0),
        switchMap((_) => {
          return this.rouletteService.updateMatch(this.requestType);
        })
      )
      .subscribe((request) => (this.request = request));
  }
}
