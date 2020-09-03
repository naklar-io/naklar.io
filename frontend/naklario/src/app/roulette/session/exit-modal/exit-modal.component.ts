import { Component, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'roulette-exit-modal',
  templateUrl: './exit-modal.component.html',
  styleUrls: ['./exit-modal.component.scss']
})
export class ExitModalComponent implements OnInit {

  constructor(
    public modal: NgbActiveModal
  ) {

  }

  ngOnInit(): void {
  }

}
