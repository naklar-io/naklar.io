import { Component, OnInit } from '@angular/core'
import { BehaviorSubject } from 'rxjs'

@Component({
  selector: 'home-more-information',
  templateUrl: './more-information.component.html',
  styleUrls: ['./more-information.component.scss']
})
export class MoreInformationComponent implements OnInit {
  currentScrollSection$$ = new BehaviorSubject('')

  constructor() {
  }

  ngOnInit(): void {
  }

  onScrollSectionChange(id: string) {
    this.currentScrollSection$$.next(id)
  }
}
