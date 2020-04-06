import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { Validators, FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { first } from "rxjs/operators";
import { SendableLogin, User } from "src/app/_models";

@Component({
  selector: "account-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
  // DONT USE PROVIDERS IF already using PROVIDED in
})
export class LoginComponent implements OnInit {
  loginForm = this.fb.group({
    email: ["", [Validators.required, Validators.email]],
    password: ["", Validators.required],
  });

  submitted = false;
  submitSuccess = false;
  loading = false;
  returnUrl: string;
  error: string = null;

  user: User = null;

  get f() {
    return this.loginForm.controls;
  }

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    // redirect to home if already logged in
    if (this.authenticationService.currentUserValue) {
      this.router.navigate(["/account"]);
    }
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.loginForm.invalid) {
      return;
    }

    const login: SendableLogin = {
      email: this.f.email.value,
      password: this.f.password.value,
    };
    this.loading = true;
    console.log("sending", login);
    this.authenticationService
      .login(login)
      .pipe(first())
      .subscribe(
        (data) => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
          //this.router.navigate(["/account"]);
          this.authenticationService
            .fetchUserData()
            .pipe(first())
            .subscribe((userData) => {
              this.user = userData;
              this.router.navigate([this.returnUrl]);
            });
        },
        (error) => {
          this.error = error;
          console.log(error);
          this.loading = false;
        }
      );
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams["returnUrl"] || "/account";
  }
}
