import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "src/app/_services";
import { Subscription } from "rxjs";

interface QueryParams {
  token?: string;
}

@Component({
  selector: "app-verify",
  templateUrl: "./verify.component.html",
  styleUrls: ["./verify.component.scss"],
})
export class VerifyComponent implements OnInit, OnDestroy {
  token: string;
  verificationOk = false;

  loading = false;
  error: string = null;

  queryParams$: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {}
  ngOnInit(): void {
    this.queryParams$ = this.route.queryParams.subscribe(
      (queryParams: QueryParams) => (this.token = queryParams.token)
    );
    this.onSubmit();
  }
  ngOnDestroy(): void {
    this.queryParams$.unsubscribe();
  }

  onSubmit(): void {
    this.loading = true;
    this.authenticationService.verify(this.token).subscribe(
      (data) => {
        this.loading = false;
        this.verificationOk = true;
        this.error = null;
      },
      (error) => {
        this.loading = false;
        this.error = error;
      }
    );
  }
}
