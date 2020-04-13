import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Match } from "src/app/_models";

@Component({
  selector: 'roulette-tutor-wait',
  templateUrl: './tutor-wait.component.html',
  styleUrls: ['./tutor-wait.component.scss'],
})
export class TutorWaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;

  match: Match;

  constructor(private rouletteService: RouletteService) {}

  ngOnInit(): void {
    this.match = null;
    this.rouletteService.updatingMatch(this.requestType).subscribe(
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
