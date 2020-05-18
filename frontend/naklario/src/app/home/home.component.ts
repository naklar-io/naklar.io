import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "../_services";
import { Router } from "@angular/router";
import { Meta, Title } from "@angular/platform-browser";

@Component({
  selector: "app-home",
  templateUrl: "./home.component.html",
  styleUrls: ["./home.component.scss"],
})
export class HomeComponent implements OnInit {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router,
    private meta: Meta,
    private title: Title
  ) {
    this.meta.addTag({
      name: "description",
      content:
        "Ehrenamtliche Tutoren geben Schülern kostenlose Nachhilfe - ganz einfach und für jeden zugänglich.",
    });
    this.title.setTitle(
      "naklar.io - Kostenlose Nachhilfe - Tutoren helfen ehrenamtlich"
    );
    this.meta.addTag({name: "keywords", content: "Kostenlose Nachhilfe Ehrenamtlich"});
  }

  ngOnInit(): void {
    this.authenticationService.isLoggedIn$.subscribe((isLoggedIn) => {
      if (isLoggedIn) {
        this.router.navigate(["/dashboard"]);
      }
    });
  }
}
