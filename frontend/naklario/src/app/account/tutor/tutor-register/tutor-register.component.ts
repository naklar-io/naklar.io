import { Component, OnInit, EventEmitter } from "@angular/core";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  Gender,
  SendableUser,
  Constants,
} from "../../../_models";
import { AuthenticationService } from "../../../_services";
import {
  passwordNotMatchValidator,
  scrollToTop,
  fileSizeValidator,
} from "../../../_helpers";
import { Options } from "ng5-slider";
import { FormGroup, FormBuilder, Validators, FormArray } from "@angular/forms";
import { first } from "rxjs/operators";
import { ActivatedRoute, Router } from "@angular/router";
import { Observable } from "rxjs";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"],
})
export class TutorRegisterComponent implements OnInit {
  states: State[];
  subjects: Subject[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];
  genders: Gender[];

  verificationFile$: Observable<string>;

  private constants: Constants;

  registerForm: FormGroup;
  sliderOptions: Options[];
  sliderRefresh: EventEmitter<void>[];
  selectedItems = [];

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
    this.route.data.subscribe((data: { constants: Constants }) => {
      this.constants = data.constants;
      this.states = data.constants.states.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      this.subjects = data.constants.subjects;
      this.schoolTypes = data.constants.schoolTypes;
      this.schoolData = data.constants.schoolData;
      this.genders = data.constants.genders;
    });

    let data: SchoolData[][] = [];
    for (let schoolType of this.schoolTypes) {
      data.push(this.schoolData.filter((x) => x.school_type === schoolType.id));
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
    this.sliderRefresh = grades.map((x) => new EventEmitter<void>());

    this.registerForm = this.fb.group(
      {
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ["", [Validators.required, Validators.email]],
        state: [this.states[0].id, Validators.required],
        gender: [this.genders[0].shortcode, Validators.required],
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ["", [Validators.required, Validators.minLength(8)]],
        img: ["", Validators.required],
        schoolTypes: this.fb.array(
          this.schoolTypes.map((x, i) => this.fb.control(i === 0)),
          Validators.required
        ),
        sliders: this.fb.array(
          grades.map((x) => this.fb.control([Math.min(...x), Math.max(...x)])),
          Validators.required
        ),
        subjects: this.fb.array(
          this.subjects.map((x, i) => this.fb.control(false)),
          Validators.required
        ),
        file: ["", [Validators.required, fileSizeValidator(8)]],
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

  onSchoolTypeSelect(index: number) {
    this.sliderRefresh[index].emit()
  }

  onImageChange(img: string) {
    this.f.img.setValue(img);
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // value needs to be primitive
      this.f.file.setValue("" + file.size);

      this.verificationFile$ = Observable.create((observer) => {
        const reader = new FileReader();
        reader.onload = (ev) => observer.next(ev.target.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  onSubmit(): void {
    this.submitted = true;
    console.log(this.f.subjects.value);
    if (this.registerForm.invalid) {
      console.log("invalid");
      return;
    }

    // compute schoolData
    let grades: number[] = [];
    for (const [i, schoolType] of this.schoolTypes.entries()) {
      if (!this.schoolTypesControl.value[i]) {
        continue;
      }
      let range = this.f.sliders.value[i];
      let g = this.schoolData
        .filter((x) => x.school_type === schoolType.id)
        .filter((x) => range[0] <= x.grade && x.grade <= range[1])
        .map((x) => x.id);
      grades.push(...g);
    }

    // wait for file
    this.verificationFile$.subscribe((verificationFile) => {
      const user: SendableUser = {
        email: this.f.email.value,
        password: this.f.password.value,
        first_name: this.f.firstName.value,
        last_name: this.f.lastName.value,
        state: this.f.state.value,
        gender: this.f.gender.value,
        terms_accepted: this.f.terms.value,
        studentdata: null,
        tutordata: {
          schooldata: grades,
          subjects: this.f.subjects.value
            .map((x, i) => (x ? this.subjects[i].id : x))
            .filter((x) => x),
          verification_file: verificationFile,
          verified: false,
          profile_picture: this.f.img.value,
        },
      };

      console.log("About to send Data: ", user);

      this.loading = true;
      this.authenticationService
        .register(user, this.constants)
        .pipe(first())
        .subscribe(
          (data) => {
            // this.router.navigate([this.returnUrl]);
            this.loading = false;
            this.submitSuccess = true;
            this.error = null;
            scrollToTop();
          },
          (error) => {
            this.error = error;
            this.loading = false;
          }
        );
    });
  }
}
