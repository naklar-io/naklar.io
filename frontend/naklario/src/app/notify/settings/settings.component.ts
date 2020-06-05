import { Component, OnInit } from "@angular/core";
import { NotifyService } from "src/app/_services";
import { FormGroup, FormControl, FormBuilder, FormArray } from "@angular/forms";
import { NotificationSettings, NotificationRange } from "src/app/_models";
import { NotificationTimeRangeComponent } from "./notification-time-range.component";
import { formatDate } from "@angular/common";

const saneModulus = (a, b) => ((a % b) + b) % b;

@Component({
  selector: "notify-settings",
  templateUrl: "./settings.component.html",
  styleUrls: ["./settings.component.scss"],
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
    enablePush: [""],
    enableMail: [""],
    notifyIntervalHours: [""],
    notifyIntervalMinutes: [""],
    notifyIntervalSeconds: [""],
    ranges: this.fb.array([]),
  });

  public get rangeControls(): FormArray {
    return this.settingsForm.get("ranges") as FormArray;
  }

  public addRange(): void {
    let currentDate = Date.now() - new Date().getTimezoneOffset() * (60 * 1000);
    let start = currentDate - (currentDate % (3600 * 1000));
    let end = start + 3600 * 2 * 1000;
    this.rangeControls.push(
      this.fb.control({
        startTime: formatDate(start, "HH:mm", "en-US"),
        endTime: formatDate(end, "HH:mm", "en-US"),
        days: [new Date().getDay() - 1],
      } as NotificationRange)
    );
  }

  /* Converts time to UTC */
  public static convertToUTC(time: string): string {
    let splits = time.split(":");
    // assume max 00:00:00
    let seconds = 0;
    if (splits.length == 3) {
      seconds += 3600 * parseInt(splits[0]);
      seconds += 60 * parseInt(splits[1]);
      seconds += parseInt(splits[2]);
    } else if (splits.length == 2) {
      seconds += 3600 * parseInt(splits[0]);
      seconds += 60 * parseInt(splits[1]);
    }
    seconds = seconds - new Date().getTimezoneOffset() * 60;
    let hours = saneModulus(Math.floor(seconds / 3600), 24);
    let minutes = saneModulus(Math.floor((seconds % 3600) / 60), 60);
    seconds = saneModulus(seconds, 60);
    console.log(hours, minutes, seconds);
    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
    );
  }
  /* Converts time to local time */
  public static convertToLocal(time: string): string {
    let splits = time.split(":");
    // assume max 00:00:00
    // min 00 seconds
    let seconds = 0;
    if (splits.length == 3) {
      seconds += 3600 * parseInt(splits[0]);
      seconds += 60 * parseInt(splits[1]);
      seconds += parseInt(splits[2]);
    } else if (splits.length == 2) {
      seconds += 3600 * parseInt(splits[0]);
      seconds += 60 * parseInt(splits[1]);
    }
    seconds = seconds + new Date().getTimezoneOffset() * 60;
    let hours = saneModulus(Math.floor(seconds / 3600), 24);
    let minutes = saneModulus(Math.floor((seconds % 3600) / 60), 60);
    seconds = saneModulus(seconds, 60);
    console.log(hours, minutes, seconds);
    return (
      hours.toString().padStart(2, "0") +
      ":" +
      minutes.toString().padStart(2, "0") +
      ":" +
      seconds.toString().padStart(2, "0")
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
    if (this.settingsForm.value.enablePush && this.notifyService.canPushSubscribe)
      this.notifyService.requestPushSubscription();
  }

  private updateData(): void {
    this.settingsForm.setControl("ranges", this.fb.array(this.settings.ranges));
    this.settingsForm.patchValue({
      enablePush: this.settings.enablePush,
      enableMail: this.settings.enableMail,
      notifyIntervalHours: this.settings.notifyInterval.split(":")[0],
      notifyIntervalMinutes: this.settings.notifyInterval.split(":")[1],
      notifyIntervalSeconds: this.settings.notifyInterval.split(":")[2],
    });
  }

  onSubmit(): void {
    if (!this.settingsForm.valid) return;
    let values = this.settingsForm.value;
    let newSettings = {
      enableMail: values.enableMail,
      enablePush: values.enablePush,
      notifyInterval:
        values.notifyIntervalHours +
        ":" +
        values.notifyIntervalMinutes +
        ":" +
        values.notifyIntervalSeconds,
      ranges: this.rangeControls.dirty
        ? values.ranges.map((range) => {
            return {
              days: range.days,
              startTime: SettingsComponent.convertToUTC(range.startTime),
              endTime: SettingsComponent.convertToUTC(range.endTime),
            } as NotificationRange;
          })
        : values.ranges,
    } as NotificationSettings;
    this.notifyService.updateSettings(newSettings).subscribe(
      (value) => {
        console.log("success", value);
      },
      (error) => {
        console.error("error", error);
      }
    );
  }
}
