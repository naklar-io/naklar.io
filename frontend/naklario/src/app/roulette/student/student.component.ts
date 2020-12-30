import {
    Component,
    OnInit,
    Output,
    EventEmitter,
    OnDestroy,
    ViewChild,
    TemplateRef,
} from '@angular/core';
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
import {
    BehaviorSubject,
    combineLatest,
    forkJoin,
    interval,
    merge,
    Observable,
    of,
    Subscription,
} from 'rxjs';
import { delay, map, startWith, switchMap, tap } from 'rxjs/operators';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { AvailableSlotService } from 'src/app/_services/database/scheduling/available-slot.service';
import { StartModalComponent } from '../start-modal/start-modal.component';
import { environment } from 'src/environments/environment';
import { AccessCodeService } from 'src/app/_services/database/account/access-code.service';
import { ConfigService } from 'src/app/_services/config.service';

export interface OnlineSubject extends Subject {
    isOnline?: boolean;
    hasAppointments?: boolean;
}
@Component({
    selector: 'roulette-student',
    templateUrl: './student.component.html',
    styleUrls: ['./student.component.scss'],
    providers: [DatabaseService],
})
export class StudentComponent implements OnInit, OnDestroy {
    @Output() done = new EventEmitter<Request>();

    readonly FEATURE_RELEASE_DATE = new Date('2020-05-14T00:00:00+02:00');

    user: User;

    constants: Constants;

    private readonly autoRefresh$ = interval(1000 * 30).pipe(startWith(0));
    private readonly refreshSub = new BehaviorSubject(null);

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
    selectedSubject: OnlineSubject | null = null;

    selectedSubjectID: number = null;
    offlineAlertClosed = false;
    accessCodesActive = false;
    canAccess = true;

    private canAccessSub: Subscription;

    @ViewChild('subjectModal') subjectModal: TemplateRef<any>;

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
        private availableSlots: AvailableSlotService,
        private modalService: NgbModal,
        private accessCodeService: AccessCodeService
    ) {}
    ngOnDestroy(): void {
        if (this.canAccessSub) {
            this.canAccessSub.unsubscribe();
        }
    }

    ngOnInit(): void {

        
        this.canAccessSub = combineLatest([this.refreshSub, ConfigService.config$])
            .pipe(
                switchMap(([_, config]) => {
                    this.accessCodesActive = config.features.codes;
                    if (this.accessCodeService) {
                        this.accessCodeService.list().subscribe();
                        return this.accessCodeService.availableCodes$.pipe(
                            map((list) => list.length > 0)
                        );
                    } else {
                        return of(true);
                    }
                    
                })
            )
            .subscribe((val) => (this.canAccess = val));

        this.subjects$ = merge(this.autoRefresh$, this.refreshSub).pipe(
            switchMap(() =>
                combineLatest([
                    this.route.data.pipe(map((d: { constants: Constants }) => d.constants)),
                    this.rouletteService.getOnlineSubjects(),
                    this.availableSlots.subjects(),
                ]).pipe(
                    map(([constants, online, appointments]) => {
                        const onlineIds = online.map((s) => s.id);
                        const appointmentIds = appointments.map((s) => s.id);
                        return constants.subjects
                            .map((s) =>
                                Object.assign(s, {
                                    isOnline: onlineIds.includes(s.id),
                                    hasAppointments: appointmentIds.includes(s.id),
                                })
                            )
                            .sort((a, b) => (a.isOnline === b.isOnline ? 0 : a.isOnline ? -1 : 1));
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
        this.modalService.dismissAll();
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

    openSubjectDialog(subject: OnlineSubject): void {
        this.selectedSubject = subject;
        const modalRef = this.modalService.open(StartModalComponent, {
            size: 'lg',
            centered: true,
        });
        modalRef.componentInstance.subject = subject;
        modalRef.componentInstance.startMatch.subscribe((x) => {
            this.startMatch();
        });

        this.selectedSubjectID = subject.id;
        modalRef.closed.subscribe(() => {
            this.refreshSub.next(null);
        });
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

    trackSubjectFn(index: number, sub: Subject) {
        return sub.id;
    }

    refresh() {
        this.refreshSub.next(null);
    }
}
