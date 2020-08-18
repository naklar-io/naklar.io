import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder } from "@angular/forms";
import { User } from "src/app/_models";

@Component({
  selector: "account-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  user: User;
  profileForm: FormBuilder;
  verifyResent = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {
    authenticationService.currentUser.subscribe((user) => (this.user = user));
  }

  ngOnInit(): void {
  }

  resendLink(): void {
    this.authenticationService.resendVerify().subscribe(() => {
      this.verifyResent = true;
    });
  }

  logoutAll(): void {
    this.authenticationService.logoutAll();
    this.router.navigate(['/'])
  }

  deleteAccount(): void {
    this.authenticationService.deleteAccount();
    this.router.navigate(['/']);
  }
}
