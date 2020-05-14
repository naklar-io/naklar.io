import { Component, OnInit, AfterViewChecked, AfterViewInit } from "@angular/core";
import { AuthenticationService, AccountType, BannerService } from "../_services";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  accountType: AccountType;

  constructor(private authenticationService: AuthenticationService, private bannerService: BannerService
    ) {}

  ngOnInit(): void {
    this.authenticationService.getAccountType().subscribe((t) => {
      this.accountType = t;
    });
    var hours = new Date().getUTCHours();
    if (hours < 8 || (hours > 10 && hours < 13) || (hours >= 15)) {
      this.bannerService.showBanner();
    }
  }
}
