import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TimeslotListComponent } from './timeslot-list/timeslot-list.component';

@Component({
  selector: 'scheduling-timeslot-btn',
  template: `
    <button class="btn nabtn-primary btn-block" (click)="openModal()">Verfügbarkeiten eintragen</button>
  `,
  styles: [
  ]
})
export class TimeslotBtnComponent implements OnInit {

  constructor(private modal: NgbModal) { }

  ngOnInit(): void {
  }

  openModal(): void {
    this.modal.open(TimeslotListComponent, {size: 'md', scrollable: true});
  }

}
