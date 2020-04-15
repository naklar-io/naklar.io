import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../_services";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  studentLink: string;
  tutorLink: string;

  user = this.authenticationService.currentUserValue;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.subscribe((loggedIn) => {
      let studentLoggedIn = "/account";
      let tutorLoggedIn = "/account";

      // guard roulette behind feature flag
      if (environment.features.roulette) {
        studentLoggedIn = "/roulette/student";
        tutorLoggedIn = "/roulette/tutor";
      }
      this.studentLink = loggedIn
        ? studentLoggedIn
        : "/account/student/register";
      this.tutorLink = loggedIn ? tutorLoggedIn : "account/tutor/register";
    });
  }
}
