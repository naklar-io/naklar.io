import { Component, OnInit } from "@angular/core";

import {
  State,
  SchoolType,
  SchoolData,
  User, Constants
} from "../../../_models/database";
import { Options } from "ng5-slider";
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: "app-student-register",
  templateUrl: "./student-register.component.html",
  styleUrls: ["./student-register.component.scss"]
})
export class StudentRegisterComponent implements OnInit {
  states: State[];
  schoolTypes: SchoolType[];
  schoolData: SchoolData[];
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

  constructor(private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants }) => {
      this.states = data.constants.states;
      this.schoolTypes = data.constants.schoolTypes;
      this.schoolData = data.constants.schoolData;
    });


  }

  onSubmit(): void {
    this.submitted = true;
  }

}
