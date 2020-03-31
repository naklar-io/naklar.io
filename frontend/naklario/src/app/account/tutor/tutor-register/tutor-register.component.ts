import { Component, OnInit } from "@angular/core";
import {GlobalDataService } from '../../../app.service'

@Component({
  selector: "account-tutor-register",
  templateUrl: "./tutor-register.component.html",
  styleUrls: ["./tutor-register.component.scss"],
})

// class UserModel {
//   constructor(
//     public email: string,
//     public password: string,
//     public first_name: string,
//     public last_name: string,
//     public state?: any,
//     public studentdata?: any,
//     public tutordata?: any
//   ) {}
// }

export class TutorRegisterComponent implements OnInit {

  constructor(private globalData: GlobalDataService) {

    
  }

  ngOnInit(): void {}
}
