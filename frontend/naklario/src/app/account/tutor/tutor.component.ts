import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../../_services";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { SendableLogin } from "src/app/_models";
import { first } from "rxjs/operators";

@Component({
  selector: "account-tutor",
  templateUrl: "./tutor.component.html",
  styleUrls: ["./tutor.component.scss"],
})
export class TutorComponent implements OnInit {
  registerUrl: string = "/account/tutor/register";
  constructor() {}

  ngOnInit(): void {}
}
