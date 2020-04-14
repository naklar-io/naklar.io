import { Component, OnInit, Input } from "@angular/core";
import { User } from "src/app/_models";

@Component({
  selector: "misc-user-card",
  templateUrl: "./user-card.component.html",
  styleUrls: ["./user-card.component.scss"],
})
export class UserCardComponent implements OnInit {
  @Input() readonly user: User;


  constructor() {}
  ngOnInit(): void {
  }
}
