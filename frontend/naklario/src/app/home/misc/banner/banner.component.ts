import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { User } from "src/app/_models";

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
  loggedIn: boolean;

  constructor(private authenticationService: AuthenticationService) {}

  ngOnInit(): void {
    this.authenticationService.currentUser.subscribe((u) => (this.user = u));
    this.authenticationService.isLoggedIn$.subscribe(
      (x) => (this.loggedIn = x)
    );
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
