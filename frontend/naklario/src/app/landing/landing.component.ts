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
      validators: [
        Validators.required,
        Validators.email,
        Validators.maxLength(254)
      ]
    }),
    updates: new FormControl(false)
  });
  emailFormSubmitted = false;

  constructor(private landingService: LandingService, private fb: FormBuilder) {
    this.onEmailFormSubmit();
  }

  onEmailFormSubmit(): void {
    if (!this.emailForm.valid) {
      return;
    }
    
    const form = {
      ind_type: this.emailForm.controls["type"].value,
      email: this.emailForm.controls["email"].value,
      updates: this.emailForm.controls["updates"].value
    };
    this.landingService.postForm(form).subscribe(
      newForm => {
        this.emailFormSubmitted = true;
      },
      // forward the error to the form
      error => {
        for (let [key, value] of Object.entries(error)) {
          this.emailForm.controls[key].setErrors({
            backend: (value as Array<string>).join(" ")
          });
        }
      }
    );
  }

  ngOnInit(): void {}
}
