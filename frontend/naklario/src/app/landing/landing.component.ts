import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"]
})
export class LandingComponent implements OnInit {
  emailForm = this.fb.group({
    type: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    updates: [false]
  });

  constructor(private fb: FormBuilder) {}

  onEmailFormSubmit() {}

  ngOnInit(): void {}
}
