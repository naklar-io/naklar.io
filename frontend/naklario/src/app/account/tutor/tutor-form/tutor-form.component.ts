import {
  Component,
  OnInit,
  EventEmitter,
  Inject,
  PLATFORM_ID,
  Input,
} from '@angular/core';
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  Gender,
  SendableUser,
  Constants,
  User,
} from '../../../_models';
import { AuthenticationService } from '../../../_services';
import {
  passwordNotMatchValidator,
  scrollToTop,
  fileSizeValidator,
} from '../../../_helpers';
import { Options } from '@angular-slider/ngx-slider';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { first, map, switchMap } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { ThrowStmt } from '@angular/compiler';
import { SwPush } from '@angular/service-worker';
import { environment } from 'src/environments/environment';
import { ConfigService } from 'src/app/_services/config.service';

@Component({
  selector: 'account-tutor-form',
  templateUrl: './tutor-form.component.html',
  styleUrls: ['./tutor-form.component.scss'],
})
export class TutorFormComponent implements OnInit {
  @Input() register: boolean;

  states: State[];
  subjects: Subject[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];
  genders: Gender[];

  enableNotifications$: Observable<boolean>;

  verificationFile$: Observable<string>;

  private constants: Constants;

  registerForm: FormGroup;
  sliderOptions: Options[];
  sliderRefresh: EventEmitter<void>[];
  selectedItems = [];

  user: User;

  submitted = false;
  submitSuccess = false;
  loading = false;
  returnUrl: string = this.route.snapshot.queryParams.returnUrl || '/';
  error: string = null;

  // FIX for ng-slider
  isBrowser: boolean;

  existingProfile: string;

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService,
    private swPush: SwPush,
    private config: ConfigService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.enableNotifications$ = config.features.pipe(map(features => features.notifications));
  }
  ngOnInit(): void {
    this.route.data.subscribe((routeData: { constants: Constants; user: User }) => {
      this.constants = routeData.constants;
      this.states = routeData.constants.states.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
      this.subjects = routeData.constants.subjects;
      this.schoolTypes = routeData.constants.schoolTypes;
      this.schoolData = routeData.constants.schoolData;
      this.genders = routeData.constants.genders;
      this.user = routeData.user;
    });

    const data: SchoolData[][] = [];
    for (const schoolType of this.schoolTypes) {
      data.push(
        this.schoolData.filter((x) => x.schoolType.id === schoolType.id)
      );
    }
    const grades = data.map((x) => x.map((y) => y.grade));
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
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        state: [this.states[0].id, Validators.required],
        gender: [this.genders[0].shortcode, Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ['', [Validators.required, Validators.minLength(8)]],
        img: ['', Validators.required],
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
        file: ['', [Validators.required, fileSizeValidator(8)]],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordNotMatchValidator }
    );

    if (!this.register) {
      this.f.firstName.setValue(this.user.firstName);
      this.f.lastName.setValue(this.user.lastName);
      this.f.email.setValue(this.user.email);
      this.f.state.setValue(this.user.state.id);
      this.f.gender.setValue(this.user.gender.shortcode);
      this.f.img.setValue(this.user.tutordata.profilePicture);
      this.f.subjects.setValue(
        this.subjects.map((outerSubject) =>
          this.user.tutordata.subjects.map((s) => s.id).includes(outerSubject.id)
        )
      );
      this.f.terms.clearValidators();
      this.f.password.setValidators(Validators.minLength(8));
      this.f.passwordRepeat.setValidators(Validators.minLength(8));
      this.f.file.clearValidators();
      this.f.schoolTypes.setValue(
        this.schoolTypes.map(
          (s) =>
            this.user.tutordata.schooldata.filter(
              (x) => x.schoolType.id === s.id
            ).length > 0
        )
      );
      this.existingProfile = this.user.tutordata.profilePicture;
      /* this.f.sliders.setValue(this.schoolTypes.map((type) => {
        let datas = this.user.tutordata.schooldata.filter((data) => data.school_type.id == type.id);
        if
      })); */
      const schoolData: SchoolData[][] = [];
      for (const schoolType of this.schoolTypes) {
        schoolData.push(
          this.schoolData.filter((x) => x.schoolType.id === schoolType.id)
        );
      }
      this.f.sliders.setValue(
        this.schoolTypes.map((type) => {
          let filtered = this.schoolData.filter(
            (x) => x.schoolType.id === type.id
          );
          const userFiltered = this.user.tutordata.schooldata.filter(
            (s) => s.schoolType.id === type.id
          );
          if (userFiltered.length > 0) {
            filtered = userFiltered;
          }
          return [
            Math.min(...filtered.map((x) => x.grade)),
            Math.max(...filtered.map((x) => x.grade)),
          ];
        })
      );
    }
  }

  get f() {
    return this.registerForm.controls;
  }

  get schoolTypesControl() {
    return this.registerForm.get('schoolTypes') as FormArray;
  }
  get subjectsControl() {
    return this.registerForm.get('subjects') as FormArray;
  }
  get sliderControl() {
    return this.registerForm.get('sliders') as FormArray;
  }

  fetchProfilePicture(url: string) {}

  onSchoolTypeSelect(index: number) {
    this.sliderRefresh[index].emit();
  }

  onImageChange(img: string) {
    this.f.img.setValue(img);
  }

  onFileChange(event) {
    if (event.target.files.length > 0) {
      const file = event.target.files[0];

      // value needs to be primitive
      this.f.file.setValue('' + file.size);

      this.verificationFile$ = new Observable((observer) => {
        const reader = new FileReader();
        reader.onload = (ev) => observer.next(ev.target.result as string);
        reader.readAsDataURL(file);
      });
    }
  }

  subscribeToNotifications(): void {
    // TODO: Fix this!
    /* 
    this.swPush
      .requestSubscription({
        serverPublicKey: environment.vapidKey,
      })
      .then((sub) => {
        // this.authenticationService.addPushSubscription(sub).subscribe((sub) => {
        //  console.log(sub);
        // });
      })
      .catch((err) => {
        console.log(err);
      });*/
  }

  onSubmit(): void {
    this.submitted = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      console.log('invalid');
      return;
    }

    // compute schoolData
    const grades: number[] = [];
    for (const [i, schoolType] of this.schoolTypes.entries()) {
      if (!this.schoolTypesControl.value[i]) {
        continue;
      }
      const range = this.f.sliders.value[i];
      const g = this.schoolData
        .filter((x) => x.schoolType.id === schoolType.id)
        .filter((x) => range[0] <= x.grade && x.grade <= range[1])
        .map((x) => x.id);
      grades.push(...g);
    }

    if (this.register) {
      // wait for file
      this.verificationFile$.subscribe((verificationFile) => {
        const user: SendableUser = {
          email: this.f.email.value,
          password: this.f.password.value,
          firstName: this.f.firstName.value,
          lastName: this.f.lastName.value,
          state: this.f.state.value,
          gender: this.f.gender.value,
          termsAccepted: this.f.terms.value,
          studentdata: null,
          tutordata: {
            schooldata: grades,
            subjects: this.f.subjects.value
              .map((x, i) => (x ? this.subjects[i].id : x))
              .filter((x) => x),
            verificationFile,
            verified: false,
            profilePicture: this.f.img.value,
          },
        };

        console.log('About to send Data: ', user);

        this.loading = true;
        this.authenticationService
          .register(user, this.constants)
          .pipe(first())
          .pipe(
            switchMap((_) =>
              this.authenticationService.login(
                { email: user.email, password: user.password },
                this.constants
              )
            )
          )
          .subscribe(
            (data) => {
              this.loading = false;
              this.submitSuccess = true;
              this.error = null;
              scrollToTop();
              this.router.navigate(['/account']);
            },
            (error) => {
              this.error = error;
              this.loading = false;
            }
          );
      });
    } else {
      const user: Partial<SendableUser> = {
        email: this.f.email.value,
        password: this.f.password.value,
        state: this.f.state.value,
        gender: this.f.gender.value,
        termsAccepted: this.f.terms.value,
        studentdata: null,
        tutordata: {
          schooldata: grades,
          subjects: this.f.subjects.value
            .map((x, i) => (x ? this.subjects[i].id : x))
            .filter((x) => x),
          verified: false,
          profilePicture: this.f.img.value,
        },
      };
      if (this.f.password.value.length === 0) {
        delete user.password;
      }
      this.loading = true;
      this.authenticationService.updateUser(user, this.constants).subscribe(
        () => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
        },
        (error) => {
          this.loading = false;
          this.submitSuccess = false;
          this.error = error;
        }
      );
    }
  }
}
