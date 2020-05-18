import { Component, Input, OnInit } from "@angular/core";
import { BehaviorSubject, interval } from "rxjs";
import { take, takeWhile, takeUntil, tap, map } from "rxjs/operators";
import { MatchRequest } from "src/app/_models";

@Component({
  selector: "home-more-information-numbers",
  templateUrl: "./numbers.component.html",
  styleUrls: ["./numbers.component.scss"],
})
export class NumbersComponent implements OnInit {
  @Input() parentCurrentScrollSectionId: BehaviorSubject<string>;

  userCounter = 0;
  // to be gotten externally in future
  readonly USERS_COUNT = 3000;

  constructor() {}

  ngOnInit(): void {
    this.parentCurrentScrollSectionId.subscribe((id) =>
      this.onParentScrollSectionChange(id)
    );
  }

  onParentScrollSectionChange(id: string) {
    const max = 3000;
    // animation time in ms
    const time = 2 * 1e3;
    const fPrime0 = 7000;
    // implementing cubic interpolation between (0,0) and (time, max)
    const cubic = (t) => {
      if (t <= 0) return 0;
      if (t >= time) return max;
      const a = -2 * max + fPrime0;
      const b = 3 * max - 2 * fPrime0;
      const c = fPrime0;
      const d = 0;
      t /= time;
      return a * t ** 3 + b * t ** 2 + c * t + d;
    };

    if (id === "numbers" && this.userCounter === 0) {
      // every 10ms send interval until
      interval(10)
        .pipe(take(time / 10))
        // tick to ms
        .pipe(map((tick) => Math.ceil(cubic((tick + 1) * 10))))
        .subscribe((x) => (this.userCounter = x));
    }
  }
}
