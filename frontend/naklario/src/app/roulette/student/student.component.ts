import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import {
    DatabaseService,
    AuthenticationService,
    RouletteService,
    ToastService,
    BannerService,
} from 'src/app/_services';
import { User, Constants, StudentRequest, Request, Subject } from 'src/app/_models';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PauseModalComponent } from '../pause-modal/pause-modal.component';
import { combineLatest, forkJoin, interval, Observable } from 'rxjs';
import { delay, map, startWith, switchMap, tap } from 'rxjs/operators';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';

interface OnlineSubject extends Subject {
    isOnline?: boolean;
    hasAppointments?: boolean;
}
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

    private readonly autoRefresh$ = interval(1000 * 30).pipe(startWith(0));

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

    subjects$: Observable<OnlineSubject[]>;

    loadDate: Date;

    selectedSubjectID: number = null;
    offlineAlertClosed = false;

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
        private appointments: AppointmentService,
        private modalService: NgbModal
    ) {}

    ngOnInit(): void {
        this.subjects$ = this.autoRefresh$.pipe(
            switchMap(() =>
                combineLatest([
                    this.route.data.pipe(map((d: { constants: Constants }) => d.constants)),
                    this.rouletteService.getOnlineSubjects().pipe(startWith([] as Subject[])),
                ]).pipe(
                    map(([constants, online]) => {
                        const onlineIds = online.map((s) => s.id);
                        return constants.subjects.map((s) =>
                            Object.assign(s, {
                                isOnline: onlineIds.includes(s.id),
                            })
                        );
                    }),
                    tap((_) => (this.loadDate = new Date()))
                )
            )
        );
        // this.refreshOnline();
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

        if (this.studentForm.invalid) {
            console.log('invalid');
            return;
        }
    }

    closeOfflineAlert(): void {
        this.offlineAlertClosed = true;
    }

    startMatch(): void {
        this.submitted = true;
        if (!this.user.emailVerified) {
            this.toast.error('Deine E-Mail muss bestätigt sein um hierhin zu kommen!');
            this.router.navigate(['/account']);
            return;
        }

        // Open pause modal

        /*     const modalRef = this.modalService.open(PauseModalComponent, { size: 'xl' });
    modalRef.result.then(
      (result) => {
      },
      (reason) => {
        console.log('dismissed');
      }
    ); */
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

    startWithSubject(subjectID: number): void {
        this.selectedSubjectID = subjectID;
        this.startMatch();
    }

    createMatchRequest() {
        this.loading = true;
        console.log('creating Request');
        this.rouletteService
            .createRequest('student', new StudentRequest(this.selectedSubjectID), this.constants)
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

    mapSubjectToName(subject: Subject): string {
        return subject.name;
    }

    allSubjectsOffline(list: OnlineSubject[]): boolean {
        const res = !list.map((s) => s.isOnline).reduce((acc, currS) => acc && currS);
        return res;
    }
}
