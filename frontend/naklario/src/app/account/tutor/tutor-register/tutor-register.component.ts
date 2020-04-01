import { Component, OnInit, OnDestroy } from "@angular/core";
import { GlobalDataService } from "../../../app.service";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  User,
  states,
  schoolData,
  schoolTypes,
  subjects
} from "../../../database-models";
import { Subscription } from "rxjs";
import { Options } from "ng5-slider";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"]
})
export class TutorRegisterComponent implements OnInit, OnDestroy {
  states: State[] = states;
  subjects: Subject[] = subjects;
  schoolTypes: SchoolType[] = schoolTypes;
  schoolData: SchoolData[] = schoolData;

  model = new User();
  submitted = false;

  slider_options: { [id: number]: Options } = {};
  slider_data: { [id: number]: { low: number; high: number } } = {};

  // private subscription_states: Subscription;
  // private subscription_subjects: Subscription;
  // private subscription_schoolTypes: Subscription;
  // private subscription_schoolData: Subscription;

  constructor(private globalData: GlobalDataService) {
    // this.subscription_states = this.globalData.states.subscribe(
    //   value => (this.states = value)
    // );
    // this.subscription_subjects = this.globalData.subjects.subscribe(
    //   value => (this.subjects = value)
    // );
    // this.subscription_schoolData = this.globalData.schooldata.subscribe(
    //   value => (this.schoolData = value)
    // );
    // this.subscription_schoolTypes = this.globalData.schooltypes.subscribe(
    //   value => {
    //     this.schoolTypes = value;
    //   }
    // );
    this.updateSliders();
  }

  updateSliders() {
    for (let schoolType of this.schoolTypes) {
      let grades = schoolData
        .filter(x => x.school_type === schoolType.id)
        .map(x => x.grade);
      let min = Math.min(...grades);
      let max = Math.max(...grades);
      
      this.slider_options[schoolType.id] = {
        animate: false,
        showTicks: true,
        floor: min,
        ceil: max
      };
      this.slider_data[schoolType.id] = { low: min, high: max };
    }
  }

  onSubmit(): void {
    this.submitted = true;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // this.subscription_states.unsubscribe();
    // this.subscription_subjects.unsubscribe();
    // this.subscription_schoolTypes.unsubscribe();
    // this.subscription_schoolData.unsubscribe();
  }
}
