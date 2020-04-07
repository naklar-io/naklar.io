import { Component, OnInit } from "@angular/core";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  states,
  schoolData,
  schoolTypes,
  subjects,
  SendableUser,
  Gender,
  genders
} from "../../../_models";
import { AuthenticationService } from "../../../_services";
import { passwordNotMatchValidator } from "../../../_helpers";
import { Options } from "ng5-slider";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { first } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { isNull } from "util";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"],
})
export class TutorRegisterComponent implements OnInit {
  states: State[] = states;
  subjects: Subject[] = subjects;
  schoolTypes: SchoolType[] = schoolTypes;
  schoolData: SchoolData[] = schoolData;
  genders: Gender[] = genders;

  registerForm: FormGroup;
  sliderOptions: Options[];

  submitted = false;
  submitSuccess = false;
  loading = false;
  returnUrl: string = this.route.snapshot.queryParams["returnUrl"] || "/";
  error: string = null;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit(): void {
    let data: SchoolData[][] = [];
    for (let schoolType of schoolTypes) {
      data.push(schoolData.filter((x) => x.school_type === schoolType.id));
    }
    let grades = data.map((x) => x.map((y) => y.grade));
    this.sliderOptions = grades.map((x) => {
      return {
        animate: false,
        showTicks: true,
        floor: Math.min(...x),
        ceil: Math.max(...x),
      };
    });

    this.registerForm = this.fb.group(
      {
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        state: [null, Validators.required],
        gender: [null, Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ["", [Validators.required, Validators.minLength(8)]],
        schoolTypes: this.fb.array(
          this.schoolTypes.map((x) => this.fb.control(null)),
          Validators.required
        ),
        sliders: this.fb.array(
          grades.map((x) => this.fb.control([Math.min(...x), Math.max(...x)])),
          Validators.required
        ),
        subjects: this.fb.array(
          this.subjects.map((x) => this.fb.control(null)),
          Validators.required
        ),
        file: ["", Validators.required],
        fileSource: ["", Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordNotMatchValidator }
    );
  }

  get f() {
    return this.registerForm.controls;
  }

  get schoolTypesControl() {
    return this.registerForm.get("schoolTypes") as FormArray;
  }
  get subjectsControl() {
    return this.registerForm.get("subjects") as FormArray;
  }
  get sliderControl() {
    return this.registerForm.get("sliders") as FormArray;
  }


  onFileChange(event) {
  
    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      this.registerForm.patchValue({
        fileSource: file
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.registerForm.invalid) {
      return;
    }

    let grades: number[] = [];
    for (const [i, schoolType] of this.schoolTypes.entries()) {
      if (!this.schoolTypesControl.value[i]) {
        continue;
      }
      let range = this.f.sliders.value[i];
      let g = schoolData
        .filter((x) => x.school_type === schoolType.id)
        .filter((x) => range[0] <= x.grade && x.grade <= range[1])
        .map((x) => x.id);
      grades.push(...g);
    }

    const user: SendableUser = {
      email: this.f.email.value,
      password: this.f.password.value,
      first_name: this.f.firstName.value,
      last_name: this.f.lastName.value,
      state: this.f.state.value.id,
      gender: this.f.gender.value,
      terms_accepted: this.f.terms.value,
      studentdata: null,
      tutordata: {
        schooldata: grades,
        subjects: this.f.subjects.value
          .map((x, i) => (x ? this.subjects[i].id : x))
          .filter(x => Boolean(x)),
          verification_file: "",
          verified: false,
        //file: this.f.get('fileSource').value
      }
    };

    console.log("About to send Data: ", user);

    this.loading = true;
    this.authenticationService
      .register(user)
      .pipe(first())
      .subscribe(
        (data) => {
          // this.router.navigate([this.returnUrl]);
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
        },
        (error) => {
          this.error = error;
          this.loading = false;
        }
      );
  }
}
