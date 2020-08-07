import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject, interval } from "rxjs";
import { take, map } from "rxjs/operators";


@Component({
  selector: "home-more-information-numbers",
  templateUrl: "./numbers.component.html",
  styleUrls: ["./numbers.component.scss"],
})
export class NumbersComponent implements OnInit {
  @Input() parentCurrentScrollSectionId: BehaviorSubject<string>;

  // to be gotten externally in future
  readonly USERS_COUNT = 5000;
  userCounter = this.USERS_COUNT;
  private hasCounted = false

  constructor() {}

  ngOnInit(): void {
    this.parentCurrentScrollSectionId.subscribe((id) =>
      this.onParentScrollSectionChange(id)
    );
  }

  onParentScrollSectionChange(id: string) {
    if (id === "numbers" && !this.hasCounted) {
      this.hasCounted = true;

      // animation time in ms
      const countDuration = 5000
      // interval of counting
      const refreshInterval = 30

      const easeOutQuint = (x) => {
        return 1 - Math.pow(1 - x, 5);
      }

      // every 10ms send interval until
      interval(refreshInterval)
        .pipe(take(countDuration / refreshInterval))
        // tick to ms
        .pipe(map((tick) => {
          // linear progress from 0...1
          const progress = tick * refreshInterval / countDuration
          return Math.ceil(this.USERS_COUNT * easeOutQuint(progress))
        }))
        .subscribe((x) => (this.userCounter = x));
    }
  }
}
