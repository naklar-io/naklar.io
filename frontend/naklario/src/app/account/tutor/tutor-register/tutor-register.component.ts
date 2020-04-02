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
  subjects,
} from "../../../_models/database-models";
import { Options } from "ng5-slider";
import { TutorRegisterService } from "./tutor-register.service";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"],
  providers: [TutorRegisterService]
})
export class TutorRegisterComponent implements OnInit, OnDestroy {
  states: State[] = states;
  subjects: Subject[] = subjects;
  schoolTypes: SchoolType[] = schoolTypes;
  schoolData: SchoolData[] = schoolData;

  model = new User();

  submitted = false;
  slider_enabled: { [id: number]: boolean } = {};
  slider_options: { [id: number]: Options } = {};
  slider_data: { [id: number]: { low: number; high: number } } = {};
  selected_subject: { [id: number]: boolean } = {};

  // private subscription_states: Subscription;
  // private subscription_subjects: Subscription;
  // private subscription_schoolTypes: Subscription;
  // private subscription_schoolData: Subscription;

  constructor(
    private globalData: GlobalDataService,
    private tutorRegisterService: TutorRegisterService
  ) {
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

    // slider setup
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
      this.slider_enabled[schoolType.id] = false;
    }

    // subjects setup
    for (let subject of this.subjects) {
      this.selected_subject[subject.id] = false;
    }
  }

  private updateUserModel(): void {
    this.model.tutordata.schooldata = this.collectSchoolData();
    this.model.tutordata.subjects = this.collectSubjects();
  }

  /**
   * form the slider ranges we need to collect the actual StudentData
   * objects to be sent to the backend
   */
  private collectSchoolData(): number[] {
    let data: number[] = [];

    for (let schoolType of this.schoolData) {
      const id = schoolType.id;
      if (!this.slider_enabled[id]) continue;
      // add selected SchoolData objects to data variable
      data.push(
        ...this.schoolData
          .filter(x => x.school_type === id)
          .filter(
            x =>
              this.slider_data[id].low <= x.grade &&
              x.grade <= this.slider_data[id].high
          )
          .map(x => x.id)
      );
    }
    return data;
  }

  private collectSubjects(): number[] {
    return this.subjects
      .filter(x => this.selected_subject[x.id])
      .map(x => x.id);
  }

  onSubmit(): void {
    this.updateUserModel();
    console.log("User Model", this.model);
    this.tutorRegisterService.postAccountCreate(this.model).subscribe(
      newForm => (this.submitted = true),
      error => error
    );
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    // this.subscription_states.unsubscribe();
    // this.subscription_subjects.unsubscribe();
    // this.subscription_schoolTypes.unsubscribe();
    // this.subscription_schoolData.unsubscribe();
  }
}
