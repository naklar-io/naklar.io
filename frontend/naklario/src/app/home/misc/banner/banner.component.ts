import { Component, OnInit } from "@angular/core";
import { AuthenticationService, BannerService } from "src/app/_services";
import { User } from "src/app/_models";
import { Router, RoutesRecognized } from "@angular/router";
import { forkJoin } from "rxjs";

type BannerType = "error" | "warning" | "info";
interface BannerMessage {
  type: BannerType;
  content: string;
}

@Component({
  selector: "app-banner",
  templateUrl: "./banner.component.html",
  styleUrls: ["./banner.component.scss"],
})
export class BannerComponent implements OnInit {
  user: User;
  display: boolean;
  isLoggedIn: boolean;

  constructor(
    private router: Router,
    private authenticationService: AuthenticationService,
    private bannerService: BannerService
  ) {}

  ngOnInit(): void {
    this.display = false;
    this.authenticationService.currentUser.subscribe((u) => (this.user = u));
    this.authenticationService.isLoggedIn$.subscribe(
      (x) => (this.isLoggedIn = x)
    );
    this.bannerService.display.subscribe((d) => (this.display = d));
  }

  getClass(type: BannerType): string {
    switch (type) {
      case "error":
        return "banner-error bg-danger text-light";
      case "warning":
        return "banner-warning bg-warning ";
      case "info":
        return "banner-info bg-primary text-light";
    }
  }
}
