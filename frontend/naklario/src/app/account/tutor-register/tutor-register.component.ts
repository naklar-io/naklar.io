import { isPlatformBrowser } from '@angular/common';
import {
    AfterViewInit,
    ElementRef,
    EventEmitter,
    PLATFORM_ID,
    ViewChild,
} from '@angular/core';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import {
    AbstractControl,
    FormArray,
    FormBuilder,
    FormGroup,
    ValidatorFn,
    Validators,
} from '@angular/forms';
import { MatStep, MatStepper } from '@angular/material/stepper';
import { ActivatedRoute } from '@angular/router';
import { Options } from '@angular-slider/ngx-slider';
import { combineLatest, Observable } from 'rxjs';
import { first, map, switchMap } from 'rxjs/operators';
import { fileSizeValidator } from 'src/app/_helpers';
import {
    Constants,
    SchoolData,
    SendableLogin,
    SendableTutorData,
    SendableUser,
    Subject,
} from 'src/app/_models';
import { AuthenticationService } from 'src/app/_services';

@Component({
    selector: 'account-tutor-register',
    templateUrl: './tutor-register.component.html',
    styleUrls: ['./tutor-register.component.scss'],
})
export class TutorRegisterComponent implements OnInit, OnDestroy, AfterViewInit {
    subjectsGroup: FormGroup;
    schoolTypesGroup: FormGroup;
    formGroup1: FormGroup;
    formGroup2: FormGroup;
    constants$: Observable<Constants>;
    subjects: Subject[];
    isBrowser: boolean;
    isLoading = false;
    errors: any = null;
    alreadySubmitted = false;

    sliderOptions: Options[];
    sliderRefresh: EventEmitter<void>[];

    @ViewChild('stepper')
    stepper: MatStepper;
    @ViewChild('subjectsForm')
    subjectsForm: ElementRef;
    @ViewChild('schoolTypesForm')
    schoolTypesForm: MatStep;
    @ViewChild('formStepper2')
    formStepper2: MatStep;

    firstStepDone = false;

    verificationFile$: Observable<string>;

    constructor(
        private auth: AuthenticationService,
        private formBuilder: FormBuilder,
        private activatedRoute: ActivatedRoute,
        @Inject(PLATFORM_ID) private platformId
    ) {}

    ngAfterViewInit(): void {
        this.stepper.selectionChange.pipe(first()).subscribe((_) => {
            if (this.stepper.selectedIndex === 0) {
                console.log('selection change');
                this.firstStepDone = true;
            }
        });
    }

    ngOnInit(): void {
        this.isBrowser = isPlatformBrowser(this.platformId);

        this.constants$ = this.activatedRoute.data.pipe(
            map((data) => {
                return data.constants;
            })
        );

        this.formGroup1 = this.formBuilder.group({
            firstName: ['', Validators.required],
            lastName: ['', Validators.required],
            email: ['', [Validators.email, Validators.required]],
            password: ['', [Validators.required, Validators.minLength(8)]],
            gender: ['', Validators.required],
        });

        this.formGroup2 = this.formBuilder.group({
            img: ['', Validators.required],
            file: ['', [Validators.required, fileSizeValidator(8)]],
            terms: [false, Validators.requiredTrue],
        });
        this.subjectsGroup = this.formBuilder.group({
            subjects: [],
            schoolTypes: [],
            sliders: [],
        });
        this.constants$.pipe(first()).subscribe((c: Constants) => {
            const data: SchoolData[][] = [];
            for (const schoolType of c.schoolTypes) {
                data.push(c.schoolData.filter((x) => x.schoolType.id === schoolType.id));
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
            this.subjectsGroup = this.formBuilder.group({
                subjects: this.formBuilder.array(
                    c.subjects.map(() => this.formBuilder.control(false)),
                    subjectsValidator()
                ),
            });
            this.subjects = c.subjects;
            this.schoolTypesGroup = this.formBuilder.group({
                schoolTypes: this.formBuilder.array(
                    c.schoolTypes.map((_) => this.formBuilder.control(false)),
                    subjectsValidator()
                ),
                sliders: this.formBuilder.array(
                    grades.map((x) => this.formBuilder.control([Math.min(...x), Math.max(...x)])),
                    Validators.required
                ),
                state: [0, Validators.required],
            });
            this.sliderRefresh = grades.map(() => new EventEmitter<void>());
            this.state.setValue(c.states[0].id);
        });
    }

    get subjectsControl() {
        // console.log(this.schoolDataGroup.get('subjects'));
        return this.subjectsGroup.get('subjects') as FormArray;
    }

    get schoolTypesControl() {
        return this.schoolTypesGroup.get('schoolTypes') as FormArray;
    }

    get sliderControl() {
        return this.schoolTypesGroup.get('sliders') as FormArray;
    }

    get firstName() {
        return this.formGroup1.get('firstName');
    }

    get lastName() {
        return this.formGroup1.get('lastName');
    }

    get email() {
        return this.formGroup1.get('email');
    }

    get genderControl() {
        return this.formGroup1.get('gender');
    }

    get file() {
        return this.formGroup2.get('file');
    }

    get terms() {
        return this.formGroup2.get('terms');
    }

    get state() {
        return this.schoolTypesGroup.get('state');
    }

    get password() {
        return this.formGroup1.get('password');
    }

    ngOnDestroy(): void {}

    onSubmit(): void {
        this.formGroup2.markAllAsTouched();
        if (!this.formGroup2.valid) {
            return;
        }
        // Here we now have to merge all the information from all of the forms.
        combineLatest([this.constants$, this.verificationFile$]).subscribe(
            ([c, file]) => {
                const grades: number[] = [];
                for (const [i, schoolType] of c.schoolTypes.entries()) {
                    if (!this.schoolTypesControl.value[i]) {
                        continue;
                    }
                    const range = this.sliderControl.value[i];
                    const g = c.schoolData
                        .filter((x) => x.schoolType.id === schoolType.id)
                        .filter((x) => range[0] <= x.grade && x.grade <= range[1])
                        .map((x) => x.id);
                    grades.push(...g);
                }
                const tutorData: SendableTutorData = {
                    schooldata: grades,
                    subjects: this.subjectsGroup.value.subjects
                        .map((active: boolean, i: number) => (active ? this.subjects[i].id : -1))
                        .filter((x: number) => x > 0),
                    verificationFile: file,
                    profilePicture: this.formGroup2.value.img,
                };
                const user: SendableUser = {
                    firstName: this.firstName.value,
                    lastName: this.lastName.value,
                    tutordata: tutorData,
                    studentdata: null,
                    email: this.email.value,
                    state: parseInt(this.state.value, 10),
                    gender: this.genderControl.value,
                    password: this.password.value,
                    termsAccepted: true,
                };
                console.log(this.state);
                console.log('Constructed user:', user);
                const login: SendableLogin = { email: user.email, password: user.password };
                console.log('Constructed login', login);
                this.isLoading = true;
                this.auth
                    .register(user, c)
                    .pipe(
                        first(),
                        switchMap(() => this.auth.login(login, c))
                    )
                    .subscribe(
                        () => {
                            this.isLoading = false;
                            this.stepper.next();
                            this.stepper.animationDone.pipe(first()).subscribe((_) => {
                                this.alreadySubmitted = true;
                            });
                        },
                        (error) => {
                            this.isLoading = false;
                            this.errors = error;
                            console.log('got error', error);
                        }
                    );
                /*
        this.auth.register(user, c).pipe(mergeMap((_) => this.auth.login(login, c))).subscribe(
          (result) => {
            console.log(result);
          },
          (error) => {
            console.log(error);
          }
        );*/
            },
            () => {}
        );
    }

    test(): void {
        console.log(this.subjectsGroup.controls.subjects.errors);
        console.log(this.subjectsGroup.valid);
    }

    onSchoolTypeSelect(i: number): void {
        this.sliderRefresh[i].emit();
    }

    onImageChange(img: string) {
        this.formGroup2.controls.img.setValue(img);
    }

    onFileChange(event) {
        if (event.target.files.length > 0) {
            const file = event.target.files[0];

            // value needs to be primitive
            this.formGroup2.controls.file.setValue('' + file.size);

            this.verificationFile$ = new Observable((observer) => {
                const reader = new FileReader();
                reader.onload = (ev) => observer.next(ev.target.result as string);
                reader.readAsDataURL(file);
            });
        }
    }
}

function subjectsValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if (control instanceof FormArray) {
            const selected: [boolean] = control.value.filter((s) => {
                return s;
            });
            if (selected.length > 0) {
                return null;
            } else {
                return { required: { value: control.value } };
            }
        } else {
            throw TypeError('This can only be used on a formarray!');
        }
        return null;
    };
}
