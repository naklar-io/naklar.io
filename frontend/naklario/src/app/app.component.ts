import { Component } from "@angular/core";
import { NotifyService, PromptUpdateService } from "./_services";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "naklar.io";
  constructor(
    private notify: NotifyService,
    private promptUpdate: PromptUpdateService
  ) {}
}
