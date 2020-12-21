import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppointmentAnswerComponent } from './appointment-answer.component';

describe('AppointmentAnswerComponent', () => {
  let component: AppointmentAnswerComponent;
  let fixture: ComponentFixture<AppointmentAnswerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AppointmentAnswerComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppointmentAnswerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
