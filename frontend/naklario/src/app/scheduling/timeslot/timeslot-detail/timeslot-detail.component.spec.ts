import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeslotDetailComponent } from './timeslot-detail.component';

describe('TimeslotDetailComponent', () => {
  let component: TimeslotDetailComponent;
  let fixture: ComponentFixture<TimeslotDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TimeslotDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeslotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
