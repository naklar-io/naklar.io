import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { DatabaseService, AuthenticationService } from "src/app/_services";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  User,
  SendableUser,
} from "src/app/_models";
import { Observable, forkJoin } from "rxjs";
import { share, tap, first, map } from "rxjs/operators";
import { Options } from "ng5-slider";

@Component({
  selector: "roulette-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [DatabaseService],
})
export class StudentComponent implements OnInit {
  @Output() done = new EventEmitter<boolean>();

  states$: Observable<State[]>;
  subjects$: Observable<Subject[]>;
  schoolTypes$: Observable<SchoolType[]>;
  schoolData$: Observable<SchoolData[]>;

  user$: Observable<User>;

  slider_options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13,
  };

  studentForm = this.fb.group({
    subject: [null, Validators.required],
    state: [null, Validators.required],
    slider: [5, Validators.required],
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
    private databaseService: DatabaseService,
    private authenticationService: AuthenticationService
  ) {}
  
  ngOnInit(): void {
    this.states$ = this.databaseService.states.pipe(share());
    this.subjects$ = this.databaseService.subjects.pipe(share());
    this.schoolTypes$ = this.databaseService.schoolTypes.pipe(share());
    this.schoolData$ = this.databaseService.schoolData.pipe(share());
    this.user$ = this.authenticationService.currentUser.pipe(share()).pipe(
      tap((user) => {
        this.f.state.setValue(user.state);
        this.f.slider.setValue(user.studentdata.school_data.grade);
      })
    );
  }

  onSubmit(): void {
    if (this.studentForm.invalid) {
      return;
    }
    forkJoin(this.user$, this.schoolData$)
      .pipe(first())
      .pipe(
        map(([user, schoolData]) => {
          console.log("promises resolved");
          const grade = this.f.slider.value;
          const selectedSchoolData = schoolData.find(
            (x) =>
              x.school_type === user.studentdata.school_data.school_type &&
              x.grade === grade
          );
          const partialUser: Partial<SendableUser> = {
            state: this.f.state.value.id,
            studentdata: {
              school_data: selectedSchoolData.id,
            },
          };

          this.loading = true;
          const auth$ = this.authenticationService
            .update(partialUser)
            .pipe(first())
            .subscribe(
              (data) => {
                this.loading = false;
                this.submitSuccess = true;
                this.error = null;
              },
              (error) => {
                this.error = error;
                this.loading = true;
              }
            );
          return auth$;
        })
      );
    Promise.all([this.user$.toPromise(), this.schoolData$.toPromise()])
      .then(([user, schoolData]) => {})
      .then(() => {
        // return back to parent component
        console.log("done");
        this.done.emit(true);
      });
  }

}
