import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import {
  DatabaseService,
  AuthenticationService,
  RouletteService,
  ToastService,
  BannerService,
} from "src/app/_services";
import { User, Constants, StudentRequest } from "src/app/_models";
import { Options } from "ng5-slider";
import { ActivatedRoute, Router } from "@angular/router";

@Component({
  selector: "roulette-student",
  templateUrl: "./student.component.html",
  styleUrls: ["./student.component.scss"],
  providers: [DatabaseService],
})
export class StudentComponent implements OnInit {
  @Output() done = new EventEmitter<boolean>();

  readonly FEATURE_RELEASE_DATE = new Date("2020-05-14T00:00:00+02:00");

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

  shouldShowInstructionVideo = true;
  isInstructionVideoShowing = false;

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
    });
    this.authenticationService.currentUser.subscribe((user) => {
      this.user = user;
    });

    // fetch, if the last meeting was done, before we implemented the "instruction video". if so, mark to show the video
    this.rouletteService.getMeetings().subscribe((meetings) => {
      if (!meetings || 0 >= meetings.length) {
        this.shouldShowInstructionVideo = true;
        return;
      }


      let lastMeetingDate = null

      for (const meeting of meetings) {
        const meetingDate = new Date(meeting.timeEnded)

        if (!lastMeetingDate) {
          lastMeetingDate = meetingDate
          continue
        }

        if (meetingDate.getTime() > lastMeetingDate.getTime()) {
          lastMeetingDate = meetingDate
        }
      }

      if (!lastMeetingDate) {
        return
      }

      const lastMeetingWasBeforeFeatureStart =
        lastMeetingDate.getTime() < this.FEATURE_RELEASE_DATE.getTime();

      this.shouldShowInstructionVideo = lastMeetingWasBeforeFeatureStart;
    });
  }

  getSchoolTypeMinMax(schoolTypeID: number): any {
    let grades = this.constants.schoolData
      .filter((x) => x.schoolType.id == schoolTypeID)
      .map((x) => x.grade);
    return [Math.min(...grades), Math.max(...grades)];
  }

  onFormSubmit(): void {
    this.submitted = true;
    this.studentForm.markAllAsTouched();
    if (!this.user.emailVerified) {
      this.toast.error(
        "Deine E-Mail muss bestätigt sein um hierhin zu kommen!"
      );
      this.router.navigate(["/account"]);
      return;
    }
    if (this.studentForm.invalid) {
      console.log("invalid");
      return;
    }

    if (this.shouldShowInstructionVideo) {
      this.isInstructionVideoShowing = true;
    } else {
      this.createMatchRequest();
    }
  }

  onVideoPrev(): void {
    this.isInstructionVideoShowing = false;
  }

  onVideoNext(): void {
    this.createMatchRequest();
  }

  createMatchRequest() {
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
