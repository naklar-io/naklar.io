import { Component, Input, OnInit } from '@angular/core'
import { BehaviorSubject, interval } from 'rxjs'
import { take, takeWhile } from 'rxjs/operators'

@Component({
  selector: 'home-more-information-numbers',
  templateUrl: './numbers.component.html',
  styleUrls: ['./numbers.component.scss']
})
export class NumbersComponent implements OnInit {
  @Input() parentCurrentScrollSectionId: BehaviorSubject<string>

  // to be gotten externally in future
  readonly USERS_COUNT = 3000
  userCounter = this.USERS_COUNT
  private hasCounted = false

  constructor() {
  }

  ngOnInit(): void {
    this.parentCurrentScrollSectionId.subscribe(id => this.onParentScrollSectionChange(id))
  }

  onParentScrollSectionChange(id: string) {
    if (id === 'numbers' && !this.hasCounted) {
      this.userCounter = 0
      this.hasCounted = true
      interval(30).pipe(take(106)).subscribe(() => this.userCounter += 19, () => {
        },
        () => interval(50).pipe(take(38)).subscribe(() => this.userCounter += 19, () => {
          },
          () => interval(70).pipe(takeWhile(() => this.userCounter < this.USERS_COUNT - 100)).subscribe(() => this.userCounter += 13, () => {
            },
            () => interval(80).pipe(take(11)).subscribe(() => this.userCounter += 6, () => {
              },
              () => interval(100).pipe(take(8)).subscribe(() => this.userCounter += 2, () => {
                },
                () => interval(120).pipe(takeWhile(() => this.userCounter + 1 < this.USERS_COUNT)).subscribe(() => this.userCounter += 1, () => {
                  },
                  () => this.userCounter = this.USERS_COUNT
                )
              )
            )
          )
        )
      )
    }
  }

}
