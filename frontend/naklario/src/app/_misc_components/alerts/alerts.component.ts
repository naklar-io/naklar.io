import { Component, OnInit, OnDestroy } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { Subscription } from "rxjs";

type AlertType = "danger" | "warning" | "info";

interface Alert {
  type: AlertType;
  message: string;
  closed: boolean;
}

@Component({
  selector: "misc-alerts",
  templateUrl: "./alerts.component.html",
  styleUrls: ["./alerts.component.scss"],
})
export class AlertsComponent implements OnInit, OnDestroy {
  alerts: Alert[];

  // timeout in ms
  readonly timeout = 5000;

  private queryParams$: Subscription;
  constructor(private router: Router, private route: ActivatedRoute) {}
  ngOnInit(): void {
    this.alerts = [];

    const alert = (type: AlertType, message: string) => {
      const a = {
        type: type,
        message: message,
        closed: false,
      };
      setTimeout(() => (a.closed = true), this.timeout);
      return a;
    };
    this.queryParams$ = this.route.queryParams.subscribe((params) => {
      if (params.error) this.alerts.push(alert("danger", params.error));
      if (params.warning) this.alerts.push(alert("warning", params.warning));
      if (params.info) this.alerts.push(alert("info", params.info));
    });
  }
  ngOnDestroy(): void {
    this.queryParams$.unsubscribe();
  }
}
