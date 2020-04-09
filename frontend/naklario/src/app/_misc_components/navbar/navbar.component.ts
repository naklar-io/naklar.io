import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { User } from "src/app/_models";
import { Router } from "@angular/router";

@Component({
  selector: "app-navbar",
  templateUrl: "./navbar.component.html",
  styleUrls: ["./navbar.component.scss"],
})
export class NavbarComponent implements OnInit {
  isNavbarCollapsed: boolean;
  user: User;
  loggedIn: boolean;
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    authenticationService.currentUser.subscribe((user) => (this.user = user));
    authenticationService.isLoggedIn$.subscribe(
      (loggedIn) => (this.loggedIn = loggedIn)
    );
  }

  ngOnInit(): void {
    this.isNavbarCollapsed = true;
  }

  logout(): void {
    this.authenticationService.logout();
    this.router.navigate(["account/login"]);
  }
}
