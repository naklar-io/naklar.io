import { Component, OnInit } from "@angular/core";
import { AuthenticationService } from "src/app/_services";
import { User } from "src/app/_models";
import { NgbModal, NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "roulette-pause-modal",
  templateUrl: "./pause-modal.component.html",
  styleUrls: ["./pause-modal.component.scss"],
})
export class PauseModalComponent implements OnInit {
  user: User;
  constructor(
    private authService: AuthenticationService,
    public modal: NgbActiveModal
  ) {
    authService.currentUser.subscribe((user) => {
      this.user = user;
    });
  }

  ngOnInit(): void {}
}
