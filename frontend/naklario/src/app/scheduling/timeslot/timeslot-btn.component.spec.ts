import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotBtnComponent } from './timeslot-btn.component';

describe('TimeslotBtnComponent', () => {
  let component: TimeslotBtnComponent;
  let fixture: ComponentFixture<TimeslotBtnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeslotBtnComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeslotBtnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
