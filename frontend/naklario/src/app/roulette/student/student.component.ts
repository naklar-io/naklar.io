import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  DatabaseService,
  AuthenticationService,
  RouletteService,
  ToastService,
} from "src/app/_services";
import {
  User,
  SendableUser,
  Constants,
  StudentRequest,
  SchoolType,
} from "src/app/_models";
import { Observable } from "rxjs";
import { tap, mergeMap, map } from "rxjs/operators";
import { Options } from "ng5-slider";
import { ActivatedRoute, Router } from "@angular/router";
import { NONE_TYPE } from "@angular/compiler";

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
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants; user: User }) => {
      this.constants = data.constants;
      this.f.subject.setValue(this.constants.subjects[0].id);

      this.user = data.user;
    });
  }

  getSchoolTypeMinMax(schoolTypeID: number): any {
    let grades = this.constants.schoolData
      .filter((x) => x.schoolType.id == schoolTypeID)
      .map((x) => x.grade);
    return [Math.min(...grades), Math.max(...grades)];
  }

  onSubmit(): void {
    this.submitted = true;
    this.studentForm.markAllAsTouched();
    if (!this.user.emailVerified) {
      this.toast.error("Deine E-Mail muss bestätigt sein um hierhin zu kommen!")
      this.router.navigate(['/account'])
    }
    if (this.studentForm.invalid) {
      console.log("invalid");
      return;
    }

    this.loading = true;
    console.log("creating Request");
    this.rouletteService
      .createMatch(
        "student",
        new StudentRequest(this.f.subject.value),
        this.constants
      )
      .subscribe(
        (data) => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
          this.router.navigate(["/roulette/student"], {
            queryParams: { state: "wait" },
          });
        },
        (error) => {
          this.loading = false;
          this.error = error;
        }
      );
  }
}
