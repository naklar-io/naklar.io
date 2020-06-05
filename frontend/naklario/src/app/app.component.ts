import { Component } from "@angular/core";
import { NotifyService } from './_services';

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
})
export class AppComponent {
  title = "naklario";
  constructor(private notify: NotifyService) {

  }

}
