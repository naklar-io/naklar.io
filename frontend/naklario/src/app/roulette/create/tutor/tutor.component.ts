import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { RouletteService, AuthenticationService } from "src/app/_services";
import { MatchRequest, StudentRequest } from "src/app/_models";

@Component({
  selector: "roulette-tutor",
  templateUrl: "./tutor.component.html",
  styleUrls: ["./tutor.component.scss"],
})
export class TutorComponent implements OnInit {
  @Output() done = new EventEmitter<boolean>();

  loading = false;
  error: string = null;

  constructor(
    private rouletteService: RouletteService,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit(): void {}

  onSubmit() {
    const subj = this.authenticationService.currentUserValue.tutordata
      .subjects[0].id;
    const request: StudentRequest = { subject: subj };
    this.rouletteService.createMatch("tutor", request).subscribe(
      (data) => {
        this.loading = false;
        this.error = null;
        this.done.emit(true);
      },
      (error) => {
        this.loading = false;
        this.error = error;
      }
    );
  }
}
