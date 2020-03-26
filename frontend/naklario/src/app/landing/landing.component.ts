import { Component, OnInit } from "@angular/core";
import {
  FormControl,
  FormGroup,
  FormBuilder,
  Validators
} from "@angular/forms";
import { LandingService } from "./landing.service";

@Component({
  selector: "app-landing",
  templateUrl: "./landing.component.html",
  styleUrls: ["./landing.component.scss"],
  providers: [LandingService]
})
export class LandingComponent implements OnInit {
  private emailForm = this.fb.group({
    type: ["", Validators.required],
    email: ["", [Validators.required, Validators.email]],
    updates: [false]
  });

  constructor(private landingService: LandingService, private fb: FormBuilder) {
    this.onEmailFormSubmit();
  }

  onEmailFormSubmit() {
    let form = {
      type: this.emailForm.controls['type'].value,
      email: this.emailForm.controls['email'].value,
      updates: this.emailForm.controls['updates'].value
    };
    this.landingService
      .postForm(form)
      .subscribe(newForm => console.log("posted:" + newForm),
      // handle error here
      error => error);
  }

  ngOnInit(): void {}
}
