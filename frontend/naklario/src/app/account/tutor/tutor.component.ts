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
  providers: [AuthenticationService]
})
export class TutorComponent implements OnInit {
  loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required]
  });

  submitted = false;
  submitSuccess = false;
  loading = false;
  returnUrl = this.route.snapshot.queryParams["returnUrl"];
  error: string = null;

  get f() {
    return this.loginForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const login: SendableLogin = {
      email: this.f.email.value,
      password: this.f.password.value
    };
    this.loading = true;
    console.log('sending', login);
    this.authenticationService
      .login(login)
      .pipe(first())
      .subscribe(
        data => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
        },
        error => {
          this.error = error;
          this.loading = false;
        }
      );
  }

  ngOnInit(): void {}
}
