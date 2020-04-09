import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../_services";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  studentLink: string;
  tutorLink: string;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.subscribe((loggedIn) => {
      this.studentLink = loggedIn
        ? "/roulette/student"
        : "/account/student/register";
      this.tutorLink = loggedIn ? "/roulette/tutor" : "account/tutor/register";
    });
  }
}
