import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../_services";
import { environment } from "src/environments/environment";
import { User } from "../_models";
import { Router } from "@angular/router";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
