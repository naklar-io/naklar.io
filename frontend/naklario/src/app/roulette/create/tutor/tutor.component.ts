import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { RouletteService, AuthenticationService } from "src/app/_services";
import {
  Constants,
  StudentRequest,
} from "src/app/_models";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "roulette-tutor",
  templateUrl: "./tutor.component.html",
  styleUrls: ["./tutor.component.scss"],
})
export class TutorComponent implements OnInit {
  @Output() done = new EventEmitter<boolean>();

  constants: Constants;

  loading = false;
  error: string = null;

  constructor(
    private route: ActivatedRoute,
    private rouletteService: RouletteService,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants }) => {
      console.log(data.constants);
      this.constants = data.constants;
    });
  }

  onSubmit() {
    const subj = this.authenticationService.currentUserValue.tutordata
      .subjects[0].id;
    this.rouletteService
      .createMatch("tutor", new StudentRequest(subj), this.constants)
      .subscribe(
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
