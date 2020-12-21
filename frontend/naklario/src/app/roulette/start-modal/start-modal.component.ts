import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Appointment } from 'src/app/_models/scheduling';
import { AppointmentService } from 'src/app/_services/database/scheduling/appointment.service';
import { OnlineSubject } from '../student/student.component';


type ModalState = 'START' | 'BOOK_SESSION' | 'APPOINTMENT_BOOKED';
const titleStateMapping = {
  START: 'Wann willst du deine Session haben?',
  BOOK_SESSION: 'Session ausmachen',
  APPOINTMENT_BOOKED: 'Übersicht über deine Session'
};

@Component({
  selector: 'roulette-start-modal',
  templateUrl: './start-modal.component.html',
  styleUrls: ['./start-modal.component.scss']
})
export class StartModalComponent implements OnInit {

  @Input() subject: OnlineSubject;
  @Output() startMatch: EventEmitter<OnlineSubject>;

  state: ModalState;
  bookedAppointment: Appointment | null = null;

  

  constructor(public modal: NgbActiveModal, private appointments: AppointmentService) { }

  ngOnInit(): void {
    this.state = 'START';
  }

  onStartMatch() {
    this.startMatch.emit(this.subject);
  }

  onStartBooking() {
    this.state = 'BOOK_SESSION';
  }

  onBooked(appointment: Appointment) {
    this.bookedAppointment = appointment;
    this.state = 'APPOINTMENT_BOOKED';
  }

  getTitle() {
    return titleStateMapping[this.state];
  }

}
