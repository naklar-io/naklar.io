import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  OnDestroy,
} from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
  DatabaseService,
  AuthenticationService,
  RouletteService,
  ToastService,
  BannerService,
} from 'src/app/_services';
import { User, Constants, StudentRequest, Request } from 'src/app/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PauseModalComponent } from '../pause-modal/pause-modal.component';

@Component({
  selector: 'roulette-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.scss'],
  providers: [DatabaseService],
})
export class StudentComponent implements OnInit {
  @Output() done = new EventEmitter<Request>();

  readonly FEATURE_RELEASE_DATE = new Date('2020-05-14T00:00:00+02:00');

  user: User;

  constants: Constants;

  studentForm = this.fb.group({
    subject: ['', Validators.required],
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
    private toast: ToastService,
    private modalService: NgbModal
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
      const lastMeeting = meetings
        .filter((meeting) => meeting.established)
        .sort(
          (a, b) =>
            new Date(b.timeEstablished).getTime() -
            new Date(a.timeEstablished).getTime()
        )[0];
      const lastMeetingDate = new Date(lastMeeting.timeEstablished);
      const lastMeetingWasBeforeFeatureStart =
        lastMeetingDate.getTime() < this.FEATURE_RELEASE_DATE.getTime();

      this.shouldShowInstructionVideo = lastMeetingWasBeforeFeatureStart;
    });
  }

  getSchoolTypeMinMax(schoolTypeID: number): any {
    const grades = this.constants.schoolData
      .filter((x) => x.schoolType.id === schoolTypeID)
      .map((x) => x.grade);
    return [Math.min(...grades), Math.max(...grades)];
  }

  onFormSubmit(): void {
    this.submitted = true;

    this.studentForm.markAllAsTouched();
    if (!this.user.emailVerified) {
      this.toast.error(
        'Deine E-Mail muss bestätigt sein um hierhin zu kommen!'
      );
      this.router.navigate(['/account']);
      return;
    }
    if (this.studentForm.invalid) {
      console.log('invalid');
      return;
    }

    // Open pause modal
    const modalRef = this.modalService.open(PauseModalComponent, {size: 'xl'});
    modalRef.result.then(
      (result) => {
        this.startMatch();
      },
      (reason) => {
        console.log('dismissed');
      }
    );
  }

  startMatch(): void {
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
    console.log('creating Request');
    this.rouletteService
      .createRequest(
        'student',
        new StudentRequest(this.f.subject.value),
        this.constants
      )
      .subscribe(
        (data) => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
          this.router.navigate(['/roulette/student'], {
            queryParams: { state: 'wait', requestID: data.id },
          });
        },
        (error) => {
          this.loading = false;
          this.error = error;
        }
      );
  }
}
