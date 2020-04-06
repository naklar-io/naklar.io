import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { Router, ActivatedRoute } from "@angular/router";
import { FormBuilder } from '@angular/forms';
import { User } from 'src/app/_models';

@Component({
  selector: "account-profile",
  templateUrl: "./profile.component.html",
  styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
  user: User;
  profileForm: FormBuilder;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    this.user = this.authenticationService.currentUserValue;
  }
}
