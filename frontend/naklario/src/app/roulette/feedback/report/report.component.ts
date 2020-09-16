import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Meeting, Report } from 'src/app/_models';
import { RouletteRequestType, RouletteService, ToastService } from 'src/app/_services';

@Component({
  selector: 'roulette-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss'],
})
export class ReportComponent implements OnInit {
  @Input() readonly meeting: Meeting;
  @Input() readonly type: RouletteRequestType;

  isOpen = false;
  // workaround for first click event
  first = false;
  form: FormGroup;

  submitSuccess = false;
  loading = false;

  constructor(
    private fb: FormBuilder,
    private rouletteService: RouletteService,
    private toastService: ToastService
  ) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      message: ['', Validators.required],
    });
  }

  get f() {
    return this.form.controls;
  }

  open() {
    this.isOpen = true;
    this.first = true;
  }

  close() {
    if (!this.first) {
      this.isOpen = false;
    }
    this.first = false;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      return;
    }
    const report: Report = {
      meeting: this.meeting.meetingId,
      message: this.f.message.value,
    };
    this.loading = true;
    this.rouletteService.postReportMeeting(report).subscribe(
      (data) => {
        this.loading = false;
        this.submitSuccess = true;
        this.isOpen = false;
      },
      (error) => {
        this.loading = false;
        this.isOpen = false;
        this.toastService.error(error);
      }
    );
  }
}
