import { Component, OnInit } from '@angular/core';
import { NotifyService } from 'src/app/_services';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { NotificationSettings, NotificationRange } from 'src/app/_models';
import { NotificationTimeRangeComponent } from './notification-time-range.component';
import { formatDate } from '@angular/common';


@Component({
  selector: 'notify-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
})
export class SettingsComponent implements OnInit {
  settings: NotificationSettings;

  constructor(private notifyService: NotifyService, private fb: FormBuilder) {
    notifyService.currentSettings$.subscribe((settings) => {
      this.settings = settings;
      this.updateData();
    });
  }

  settingsForm = this.fb.group({
    enablePush: [''],
    enableMail: [''],
    notifyIntervalHours: [''],
    notifyIntervalMinutes: [''],
    notifyIntervalSeconds: [''],
    ranges: this.fb.array([]),
    rangesMode: ['']
  });

  public get rangeControls(): FormArray {
    return this.settingsForm.get('ranges') as FormArray;
  }

  public addRange(): void {
    const currentDate = Date.now();
    const start = currentDate - (currentDate % (3600 * 1000));
    const end = start + 3600 * 2 * 1000;
    this.rangeControls.push(
      this.fb.control({
        startTime: formatDate(start, 'HH:mm', 'en-US'),
        endTime: formatDate(end, 'HH:mm', 'en-US'),
        days: [new Date().getDay() - 1],
      } as NotificationRange)
    );
  }

  ngOnInit(): void {
    /*new FormGroup({
      enablePush: new FormControl(this.settings.enablePush),
      enableMail: new FormControl(this.settings.enableMail),
      notifyIntervalHours: new FormControl(this.settings.notifyInterval),
      notifyIntervalMinutes: new FormControl(this.settings.notifyInterval),

    });*/
  }

  requestPush(e): void {
    if (
      this.settingsForm.value.enablePush &&
      this.notifyService.canPushSubscribe
    ) {
      this.notifyService.requestPushSubscription();
    }
  }

  public deleteRange(index): void {
    this.rangeControls.removeAt(index);
  }

  private updateData(): void {
    this.settingsForm.setControl('ranges', this.fb.array(this.settings.ranges));
    this.settingsForm.patchValue({
      enablePush: this.settings.enablePush,
      enableMail: this.settings.enableMail,
      notifyIntervalHours: this.settings.notifyInterval.split(':')[0],
      notifyIntervalMinutes: this.settings.notifyInterval.split(':')[1],
      notifyIntervalSeconds: this.settings.notifyInterval.split(':')[2],
      rangesMode: this.settings.rangesMode
    });
  }

  onSubmit(): void {
    if (!this.settingsForm.valid) { return; }
    const values = this.settingsForm.value;
    const newSettings = {
      enableMail: values.enableMail,
      enablePush: values.enablePush,
      notifyInterval:
        values.notifyIntervalHours +
        ':' +
        values.notifyIntervalMinutes +
        ':' +
        values.notifyIntervalSeconds,
      ranges: this.rangeControls.value,
      rangesMode: values.rangesMode
    } as NotificationSettings;
    this.notifyService.updateSettings(newSettings).subscribe(
      (value) => {
        console.log('success', value);
      },
      (error) => {
        console.error('error, trying to CREATE (POST)', error);
        this.notifyService.createSettings(newSettings).subscribe(
          (value) => {
            console.log('success creating', value);
          }
        );
      }
    );
  }
}
