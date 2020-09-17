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
  SchoolType,
  SchoolData,
  Gender,
  Constants,
  SendableUser,
  User,
} from '../../../_models/database';
import { first } from 'rxjs/operators';
import { Options } from '@m0t0r/ngx-slider';
import { AuthenticationService } from '../../../_services';
import { FormBuilder, Validators, FormGroup } from '@angular/forms';
import { passwordNotMatchValidator } from '../../../_helpers';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'account-student-form',
  templateUrl: './student-form.component.html',
  styleUrls: ['./student-form.component.scss'],
})
export class StudentFormComponent implements OnInit {
  @Input() register: boolean;

  states: State[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];
  genders: Gender[];
  schoolType = -1;
  grade = -1;

  private user: User;

  registerForm: FormGroup;
  private constants: Constants;

  // slider controls
  options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13,
  };

  sliderRefresh = new EventEmitter<void>();

  submitted = false;
  submitSuccess = false;
  loading = false;
  error: string = null;

  isBrowser: boolean;

  get f() {
    return this.registerForm.controls;
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants; user: User }) => {
      this.constants = data.constants;
      this.states = data.constants.states;
      this.schoolTypes = data.constants.schoolTypes;
      this.schoolData = data.constants.schoolData;
      this.genders = data.constants.genders;
      this.user = data.user;
    });

    this.registerForm = this.fb.group(
      {
        firstName: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        gender: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ['', [Validators.required, Validators.minLength(8)]],
        state: [this.states[0].id, Validators.required],
        schoolType: [this.schoolTypes[0].id, Validators.required],
        slider: [10, Validators.required],
        terms: [false, Validators.requiredTrue],
      },
      { validators: passwordNotMatchValidator }
    );

    console.log(this.register);
    if (!this.register) {
      this.f.firstName.setValue(this.user.firstName);
      this.f.email.setValue(this.user.email);
      this.f.gender.setValue(this.user.gender.shortcode);
      this.f.state.setValue(this.user.state.id);
      this.f.schoolType.setValue(this.user.studentdata.schoolData.schoolType.id);
      this.f.slider.setValue(this.user.studentdata.schoolData.grade);
      this.f.terms.clearValidators();
      this.f.password.setValidators(Validators.minLength(8));
      this.f.passwordRepeat.setValidators(Validators.minLength(8));
      // this.f.password.clearValidators()
      // this.f.passwordRepeat.clearValidators();
      this.refreshSliderOptions();
    }
    this.sliderRefresh.emit();
    this.refreshSliderOptions();
  }

  refreshSliderOptions() {
    const grades = this.schoolData
      .filter((x) => x.schoolType.id === parseInt(this.f.schoolType.value, 10))
      .map((x) => x.grade);
    const newOptions = Object.assign({}, this.options) as Options;
    newOptions.floor = Math.min(...grades);
    newOptions.ceil = Math.max(...grades);
    this.options = newOptions;
  }

  onSubmit(): void {
    this.submitted = true;
    this.registerForm.markAllAsTouched();

    if (this.registerForm.invalid) {
      return;
    }

    const user: SendableUser = {
      email: this.f.email.value,
      password: this.f.password.value,
      firstName: this.f.firstName.value,
      lastName: '',
      state: this.f.state.value,
      termsAccepted: this.f.terms.value,
      gender: this.f.gender.value,
      studentdata: {
        schoolData: this.schoolData.find(
          (x) =>
            x.grade === Number(this.f.slider.value) &&
            x.schoolType.id === Number(this.f.schoolType.value)
        ).id,
      },
      tutordata: null,
    };
    console.log('About to send student Data: ', user);
    if (this.register) {
      this.loading = true;
      this.authenticationService
        .register(user, this.constants)
        .pipe(first())
        .pipe(
          switchMap((_) =>
            this.authenticationService.login(
              {
                email: user.email,
                password: user.password,
              },
              this.constants
            )
          )
        )
        .subscribe(
          () => {
            this.loading = false;
            this.submitSuccess = true;
            this.error = null;
            this.router.navigate(['/account']);
          },
          (error) => {
            this.error = error;
            this.loading = false;
          }
        );
    } else {
      console.log('Updating user');
      this.loading = true;
      const toSend = user;
      if (toSend.password.length === 0) {
        delete toSend.password;
      }
      this.authenticationService.updateUser(toSend, this.constants).subscribe(
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
