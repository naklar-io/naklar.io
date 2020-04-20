import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, Validators } from "@angular/forms";
import { passwordNotMatchValidator } from "src/app/_helpers";
import { first } from "rxjs/operators";

@Component({
  selector: "account-password-reset",
  templateUrl: "./password-reset.component.html",
  styleUrls: ["./password-reset.component.scss"],
})
export class PasswordResetComponent implements OnInit {
  private token: string;

  form;

  submitSuccess: boolean;
  loading: boolean;
  error: string = null;

  constructor(
    private authenticationService: AuthenticationService,
    private route: ActivatedRoute,
    private fb: FormBuilder,
    private router: Router
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      this.token = params.get("token");
    });
    this.form = this.fb.group(
      {
        password: ["", [Validators.required, Validators.minLength(8)]],
        passwordRepeat: ["", [Validators.required, Validators.minLength(8)]],
      },
      { validators: passwordNotMatchValidator }
    );
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      console.log("invalid");
      return;
    }

    this.loading = true;
    this.authenticationService
      .resetPassword(this.f.password.value, this.token)
      .pipe(first())
      .subscribe(
        (data) => {
          // console.log(data);
          this.loading = false;
          this.error = null;
          this.submitSuccess = true;
          this.router.navigate(["/account/login"])
        },
        (error) => {
          this.error = error;
          console.log(error.status);
          this.loading = false;
        }
      );
  }
}
