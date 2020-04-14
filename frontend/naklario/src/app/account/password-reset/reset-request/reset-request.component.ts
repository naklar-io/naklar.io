import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { FormBuilder, Validators } from "@angular/forms";
import { first } from 'rxjs/operators';

@Component({
  selector: "account-reset-request",
  templateUrl: "./reset-request.component.html",
  styleUrls: ["./reset-request.component.scss"],
})
export class ResetRequestComponent implements OnInit {
  form = this.fb.group({
    email: ["", Validators.required],
  });
  submitSuccess: boolean;
  loading: boolean;
  error: string = null;

  constructor(
    private authenticationService: AuthenticationService,
    private fb: FormBuilder
  ) {}

  get f() {
    return this.form.controls;
  }

  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true;
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      return;
    }

    this.authenticationService.requestPasswordReset(this.f.email.value).pipe(
      first()).subscribe((data) => {
        console.log(data);
        this.loading = false;
        this.error = null;
        this.submitSuccess = true;
      },
      (error) =>{
        this.error = error;
        this.loading = false;
      });
  }
}
