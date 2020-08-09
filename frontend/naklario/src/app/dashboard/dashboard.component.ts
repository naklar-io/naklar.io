import {
  Component,
  OnInit,
  AfterViewChecked,
  AfterViewInit,
} from "@angular/core";
import {
  AuthenticationService,
  AccountType,
  BannerService,
} from "../_services";
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { PauseModalComponent } from '../roulette/pause-modal/pause-modal.component';

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.component.html",
  styleUrls: ["./dashboard.component.scss"],
})
export class DashboardComponent implements OnInit {
  accountType: AccountType;

  constructor(
    private authenticationService: AuthenticationService,
    private bannerService: BannerService,
    private modalService: NgbModal,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authenticationService.getAccountType().subscribe((t) => {
      this.accountType = t;
    });
    var hours = new Date().getUTCHours();
    if (hours < 8 || (hours > 10 && hours < 13) || hours >= 15) {
      this.bannerService.showBanner();
    }
  }

  startTutorMatching(): void {
    this.modalService.open(PauseModalComponent).result.then((result) => {
      this.router.navigateByUrl("/roulette/tutor");
    }, (reason) => {
      console.log("dismissed");
    })
  }
}
