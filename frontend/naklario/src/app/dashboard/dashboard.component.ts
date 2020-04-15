import { Component, OnInit } from "@angular/core";
import { AuthenticationService, AccountType } from "../_services";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  accountType: AccountType;

  constructor(private authenticationService: AuthenticationService) {}
  ngOnInit(): void {
    this.authenticationService
      .getAccountType()
      .subscribe((t) => (this.accountType = t));
  }
}
