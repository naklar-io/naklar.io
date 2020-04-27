import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthenticationService } from "src/app/_services";
import { Subscription } from "rxjs";
import { isPlatformBrowser } from "@angular/common";

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
  loggedIn;

  queryParams$: Subscription;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}
  ngOnInit(): void {
    this.queryParams$ = this.route.queryParams.subscribe(
      (queryParams: QueryParams) => (this.token = queryParams.token)
    );
    this.loading = true;
    if (isPlatformBrowser(this.platformId)) {
      this.onSubmit();
    }
    this.authenticationService.isLoggedIn$.subscribe(
      (loggedIn) => {
        this.loggedIn = loggedIn;
      }
    )
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
        this.verificationOk = false;
        this.error = error;
      }
    );
  }
}
