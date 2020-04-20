import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { User } from "src/app/_models";
import { ActivatedRoute } from "@angular/router";
import { BannerData } from "src/app/_services/banner-resolver.service";

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
    private route: ActivatedRoute,
    private authenticationService: AuthenticationService
  ) {}

  ngOnInit(): void {
    /**
    this.route.data.subscribe((data: { banner: BannerData }) => {
      console.log("resolved", data);
      if (data.banner) {
        this.display = data.banner.display;
      }
    }); */
    this.authenticationService.currentUser.subscribe((u) => (this.user = u));
    this.authenticationService.isLoggedIn$.subscribe((x) => (this.display = x));
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
