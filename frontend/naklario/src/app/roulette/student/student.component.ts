import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { DatabaseService, AuthenticationService } from "src/app/_services";
import { State, Subject, SchoolType, SchoolData, User } from "src/app/_models";
import { Observable } from "rxjs";
import { share, tap } from "rxjs/operators";
import { Options } from "ng5-slider";

@Component({
  selector: "roulette-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [DatabaseService]
})
export class StudentComponent implements OnInit {
  states$: Observable<State[]>;
  subjects$: Observable<Subject[]>;
  schoolTypes$: Observable<SchoolType[]>;
  schoolData$: Observable<SchoolData[]>;

  user$: Observable<User>;

  slider_options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13
  };

  studentForm = this.fb.group({
    subject: [null, Validators.required],
    state: [null, Validators.required],
    slider: [5, Validators.required]
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

  onSubmit(): void {
    this.submitted = true;
     
    console.log(this.studentForm);
  }

  ngOnInit(): void {
    this.states$ = this.databaseService.states.pipe(share());
    this.subjects$ = this.databaseService.subjects.pipe(share());
    this.schoolTypes$ = this.databaseService.schoolTypes.pipe(share());
    this.schoolData$ = this.databaseService.schoolData.pipe(share());
    this.user$ = this.authenticationService.currentUser.pipe(share()).pipe(
      tap(user => {
        this.f.state.setValue(user.state);
        this.f.slider.setValue(user.studentdata.school_data.grade);
        console.log("updating user", this.f);
      })
    );
  }
}
