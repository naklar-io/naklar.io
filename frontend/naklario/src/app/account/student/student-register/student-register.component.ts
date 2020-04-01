import { Component, OnInit } from "@angular/core";

import {
  State,
  SchoolType,
  SchoolData,
  User,
  states,
  schoolData,
  schoolTypes
} from "../../../database-models";
import { Options } from "ng5-slider";

@Component({
  selector: "app-student-register",
  templateUrl: "./student-register.component.html",
  styleUrls: ["./student-register.component.scss"]
})
export class StudentRegisterComponent implements OnInit {
  states: State[] = states;
  schoolTypes: SchoolType[] = schoolTypes;
  schoolData: SchoolData[] = schoolData;
  schoolType: number = -1;
  grade: number = -1;

  model = new User();

  // slider controls
  options: Options = {
    animate: false,
    showTicks: true,
    floor: 5,
    ceil: 13
  };

  submitted = false;

  constructor() {}

  onSubmit(): void {
    this.submitted = true;
  }

  ngOnInit(): void {}
}
