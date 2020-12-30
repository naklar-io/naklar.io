import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotListComponent } from './timeslot-list.component';

describe('TimeslotListComponent', () => {
  let component: TimeslotListComponent;
  let fixture: ComponentFixture<TimeslotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeslotListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeslotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
