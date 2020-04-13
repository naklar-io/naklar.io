import { Component, OnInit, Input, OnDestroy } from "@angular/core";
import { RouletteService, RouletteRequestType } from "src/app/_services";
import { Match } from "src/app/_models";

@Component({
  selector: 'roulette-student-wait',
  templateUrl: './student-wait.component.html',
  styleUrls: ['./student-wait.component.scss']
})
export class StudentWaitComponent implements OnInit, OnDestroy {
  @Input() readonly requestType: RouletteRequestType;

  match: Match;

  constructor(private rouletteService: RouletteService) {}

  get tutor() {
    return this.match.tutor;
  }

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
