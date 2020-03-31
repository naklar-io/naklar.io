import { Component, OnInit, OnDestroy } from "@angular/core";
import { GlobalDataService } from "../../../app.service";
import {
  State,
  Subject,
  SchoolType,
  SchoolData,
  User
} from "../../../database-models";
import { Subscription } from "rxjs";

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"]
})
export class TutorRegisterComponent implements OnInit, OnDestroy {
  states: State[];
  subjects: Subject[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];

  model = new User("", "", "", "", -1, -1, -1);
  submitted = false;

  private subscription_states: Subscription;
  private subscription_subjects: Subscription;
  private subscription_schoolTypes: Subscription;
  private subscription_schoolData: Subscription;

  constructor(private globalData: GlobalDataService) {
    this.subscription_states = this.globalData.states.subscribe(
      value => (this.states = value)
    );
    this.subscription_subjects = this.globalData.subjects.subscribe(
      value => (this.subjects = value)
    );
    this.subscription_schoolData = this.globalData.schooldata.subscribe(
      value => (this.schoolData = value)
    );
    this.subscription_schoolTypes = this.globalData.schooltypes.subscribe(
      value => (this.schoolTypes = value)
    );
  }

  onSubmit(): void {}

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this.subscription_states.unsubscribe();
    this.subscription_subjects.unsubscribe();
    this.subscription_schoolTypes.unsubscribe();
    this.subscription_schoolData.unsubscribe();
  }
}
