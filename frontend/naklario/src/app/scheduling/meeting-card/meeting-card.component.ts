import { Component, OnInit } from "@angular/core";
import { environment } from "src/environments/environment";

@Component({
  selector: "scheduling-meeting-card",
  templateUrl: "./meeting-card.component.html",
  styleUrls: ["./meeting-card.component.scss"],
})
export class MeetingCardComponent implements OnInit {
  //featureEnabled = environment.features.scheduling;
  featureEnabled = true;
  constructor() {}

  ngOnInit(): void {}
}
