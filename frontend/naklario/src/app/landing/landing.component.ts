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
  emailForm = new FormGroup({
    type: new FormControl("", Validators.required),
    email: new FormControl("", {
      updateOn: "submit",
      validators: [Validators.required, Validators.email, Validators.maxLength(254)]
    }),
    updates: new FormControl(false)
  });

  constructor(private landingService: LandingService, private fb: FormBuilder) {
    this.onEmailFormSubmit();
  }

  onEmailFormSubmit() {
    if (!this.emailForm.valid) {
      return;
    }
    const form = {
      ind_type: this.emailForm.controls["type"].value,
      email: this.emailForm.controls["email"].value,
      updates: this.emailForm.controls["updates"].value
    };
    this.landingService.postForm(form).subscribe(
      newForm => console.log("posted:" + newForm),
      // handle error here
      error => error
    );
  }

  ngOnInit(): void {}
}
