import { Component, OnInit } from "@angular/core";

import {
  State,
  SchoolType,
  SchoolData,
  Gender,
  Constants,
  SendableUser,
} from "../../../_models/database";
import { first } from "rxjs/operators";
import { Options } from "ng5-slider";
import { AuthenticationService } from "../../../_services";
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import { passwordNotMatchValidator } from "../../../_helpers";
import { Router, ActivatedRoute } from "@angular/router";

@Component({
  selector: "app-student-register",
  templateUrl: "./student-register.component.html",
  styleUrls: ["./student-register.component.scss"],
})
export class StudentRegisterComponent implements OnInit {
  states: State[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];
  genders: Gender[];
  schoolType: number = -1;
  grade: number = -1;

  registerForm: FormGroup;
  private constants: Constants;

  // slider controls
  options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13,
  };

  submitted = false;
  submitSuccess = false;
  loading = false;
  error: string = null;

  get f() {
    return this.registerForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants }) => {
      this.constants = data.constants;
      this.states = data.constants.states;
      this.schoolTypes = data.constants.schoolTypes;
      this.schoolData = data.constants.schoolData;
      this.genders = data.constants.genders;
    });
    this.registerForm = this.fb.group(
      {
        firstName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        gender: ["", Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ["", [Validators.required, Validators.minLength(8)]],
        state: ["", Validators.required],
        schoolType: ["", Validators.required],
        slider: [10, Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordNotMatchValidator }
    );
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    const user: SendableUser = {
      email: this.f.email.value,
      password: this.f.password.value,
      first_name: this.f.firstName.value,
      last_name: "",
      state: this.f.state.value,
      terms_accepted: this.f.terms.value,
      gender: this.f.gender.value,
      studentdata: {
        school_data: this.schoolData.find(
          (x) =>
            x.grade === Number(this.f.slider.value) &&
            x.school_type === Number(this.f.schoolType.value)
        ).id,
      },
      tutordata: null,
    };
    console.log("About to send student Data: ", user);

    this.loading = true;
    this.authenticationService
      .register(user, this.constants)
      .pipe(first())
      .subscribe(
        (data) => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
          this.router.navigate(["/roulette/student"]);
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
  }
}
