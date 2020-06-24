import { Component, OnInit, Input, forwardRef, Output, EventEmitter } from "@angular/core";
import { NotificationRange, Day } from "src/app/_models";
import {
  FormGroup,
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormBuilder,
} from "@angular/forms";
import { formatDate } from "@angular/common";
import { SettingsComponent } from './settings.component';

const TIMERANGE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => NotificationTimeRangeComponent),
  multi: true,
};


const DAYS = [
  "Montag",
  "Dienstag",
  "Mittwoch",
  "Donnerstag",
  "Freitag",
  "Samstag",
  "Sonntag",
];
@Component({
  selector: "notify-notification-time-range",
  providers: [TIMERANGE_VALUE_ACCESSOR],
  templateUrl: "./notification-time-range.component.html",
  styleUrls: ["./notification-time-range.component.scss"],
})
export class NotificationTimeRangeComponent implements ControlValueAccessor {
  range: NotificationRange;
  private disabled: boolean;
  private onChange: Function;
  private onTouched: Function;

  @Output() deleted = new EventEmitter<boolean>();

  days = DAYS.map((d, i) => {
    return {
      label: d,
      value: i,
    };
  });

  rangeForm = this.fb.group({
    startTime: [""],
    endTime: [""],
    days: [""],
    pk: [""]
  });

  constructor(private fb: FormBuilder) {

    this.onChange = (_: any) => {};
    this.onTouched = () => {};
    this.disabled = false;
  }

  writeValue(obj: any): void {
    this.range = obj;
    this.rangeForm.patchValue({
      startTime: this.range.startTime,
      endTime: this.range.endTime,
      days: this.range.days,
      pk: this.range.pk
    });
  }

  registerOnChange(fn: any): void {
    this.rangeForm.valueChanges.subscribe(fn);
  }
  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    isDisabled ? this.rangeForm.disable() : this.rangeForm.enable();
  }

  public test(): void {
    console.log(this.rangeForm);
  }

  public delete() {
    this.deleted.emit(true);
  }
}
