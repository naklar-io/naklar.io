import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from 'src/app/_services';
import { Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { first } from 'rxjs/operators';
import { SendableLogin, User, Constants } from 'src/app/_models';

@Component({
  selector: 'account-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @Input() registerUrl: string;
  // if the login component was embedded by another site
  embedded = false;
  private constants: Constants;

  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  submitted = false;
  submitSuccess = false;
  loading = false;
  returnUrl: string =
    this.route.snapshot.queryParams.returnUrl || '/dashboard';
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
  ) {}
  ngOnInit(): void {
    this.route.data.subscribe((data: { constants: Constants }) => {
      this.constants = data.constants;
    });

    if (!this.registerUrl) {
      // component was not embedded
      this.embedded = false;
      this.registerUrl = '/account/student/register';
    } else {
      // component was embedded
      this.embedded = true;
    }

    // redirect to home if already logged in
    if (!this.embedded && this.authenticationService.isLoggedIn) {
      this.router.navigate([this.returnUrl]);
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
    // console.log("Logging in user: ", login, this.constants);

    this.loading = true;
    this.authenticationService
      .login(login, this.constants)
      .pipe(first())
      .subscribe(
        (userData) => {
          this.loading = false;
          this.submitSuccess = true;
          this.error = null;
          this.user = userData;
          this.router.navigate([this.returnUrl]);
        },
        (error) => {
          this.error = error;
          console.log(error);
          this.loading = false;
        }
      );
  }
}
