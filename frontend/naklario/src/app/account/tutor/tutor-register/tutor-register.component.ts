import { Component, OnInit, OnDestroy } from "@angular/core";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  User,
  states,
  schoolData,
  schoolTypes,
  subjects,
  SendableUser
} from "../../../_models";
import { AuthenticationService } from "../../../_services";
import { Options } from "ng5-slider";
import { FormBuilder, Validators } from "@angular/forms";
import { first } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"],
  providers: [AuthenticationService]
})
export class TutorRegisterComponent implements OnInit {
  states: State[] = states;
  subjects: Subject[] = subjects;
  schoolTypes: SchoolType[] = schoolTypes;
  schoolData: SchoolData[] = schoolData;

  registerForm = this.fb.group({
    firstName: ["", Validators.required],
    lastName: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    state: [null, Validators.required],
    password: ["", [Validators.required, Validators.minLength(8)]],
    passwordRepeat: ["", [Validators.required, Validators.minLength(8)]],
    schoolTypes: [[], Validators.required],
    subjects: [[], Validators.required],
    terms: [false, Validators.required]
  });

  submitted = false;
  loading = false;
  returnUrl: string = this.route.snapshot.queryParams["returnUrl"] || "/";
  error: string;

  slider_options: Options = { floor: 5, ceil: 13 };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    //    // slider setup
    //    for (let schoolType of this.schoolTypes) {
    //      let grades = schoolData
    //        .filter(x => x.school_type === schoolType.id)
    //        .map(x => x.grade);
    //      let min = Math.min(...grades);
    //      let max = Math.max(...grades);
    //
    //      this.slider_options[schoolType.id] = {
    //        animate: false,
    //        showTicks: true,
    //        floor: min,
    //        ceil: max
    //      };
    //      this.slider_data[schoolType.id] = { low: min, high: max };
    //      this.slider_enabled[schoolType.id] = false;
    //    }
    //
    //// subjects setup
    //for (let subject of this.subjects) {
    //  this.selected_subject[subject.id] = false;
    //}
  }
  //
  //  /**
  //   * form the slider ranges we need to collect the actual StudentData
  //   * objects to be sent to the backend
  //   */
  //  private collectSchoolData(): number[] {
  //    let data: number[] = [];
  //
  //    for (let schoolType of this.schoolData) {
  //      const id = schoolType.id;
  //      if (!this.slider_enabled[id]) continue;
  //      // add selected SchoolData objects to data variable
  //      data.push(
  //        ...this.schoolData
  //          .filter(x => x.school_type === id)
  //          .filter(
  //            x =>
  //              this.slider_data[id].low <= x.grade &&
  //              x.grade <= this.slider_data[id].high
  //          )
  //          .map(x => x.id)
  //      );
  //    }
  //    return data;
  //  }
  //
  // private collectSubjects(): number[] {
  //   return this.subjects
  //     .filter(x => this.selected_subject[x.id])
  //     .map(x => x.id);
  // }

  get f() {
    return this.registerForm.controls;
  }

  onSubmit(): void {
    const user: SendableUser = {
      email: this.f.email.value,
      password: this.f.password.value,
      first_name: this.f.firstName.value,
      last_name: this.f.lastName.value,
      state: this.f.state.value,
      terms_accepted: this.f.termsAccepted.value,
      studentdata: {
        school_data: -1
      },
      tutordata: {
        schooldata: [],
        subjects: []
      }
    };

    console.log("About to send Data: ", user);
    return;

    this.loading = true;
    this.authenticationService
      .register(user)
      .pipe(first())
      .subscribe(
        data => {
          // this.router.navigate([this.returnUrl]);
          this.loading = false;
          this.submitted = true;
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
  }

  ngOnInit(): void {}
}
