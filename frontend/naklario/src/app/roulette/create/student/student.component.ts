import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  DatabaseService,
  AuthenticationService,
  RouletteService,
} from "src/app/_services";
import { User, SendableUser, Constants, StudentRequest } from "src/app/_models";
import { tap, mergeMap } from "rxjs/operators";
import { Options } from "ng5-slider";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "roulette-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [DatabaseService],
})
export class StudentComponent implements OnInit {
  @Output() done = new EventEmitter<boolean>();

  user: User;

  constants: Constants;

  slider_options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13,
  };

  studentForm = this.fb.group({
    subject: ["", Validators.required],
    state: [-1, Validators.required],
    slider: [-1, Validators.required],
  });

  submitted = false;
  submitSuccess = false;
  loading = false;
  error: string = null;

  get f() {
    return this.studentForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private authenticationService: AuthenticationService,
    private rouletteService: RouletteService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants }) => {
      this.constants = data.constants;
    });

    this.user = this.authenticationService.currentUserValue;
    this.f.state.setValue(this.user.state.id);
    this.f.slider.setValue(this.user.studentdata.school_data.grade);
  }

  onSubmit(): void {
    this.submitted = true;
    this.studentForm.markAllAsTouched();

    if (this.studentForm.invalid) {
      console.log("invalid");
      return;
    }

    const grade = this.f.slider.value;
    const selectedSchoolData = this.constants.schoolData.find(
      (x) =>
        x.school_type === this.user.studentdata.school_data.school_type &&
        x.grade === grade
    );
    const partialUser: Partial<SendableUser> = {
      state: this.f.state.value,
      studentdata: {
        school_data: selectedSchoolData.id,
      },
    };

    console.log("updating user", partialUser);
    this.loading = true;
    this.authenticationService
      .updateUser(partialUser, this.constants)
      .pipe(tap((_) => console.log("creating Match")))
      .pipe(
        mergeMap((_) =>
          this.rouletteService.createMatch(
            "student",
            new StudentRequest(this.f.subject.value),
            this.constants
          )
        )
      )
      .subscribe(
        (data) => {
          this.loading = false;
          this.submitSuccess = true;
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
