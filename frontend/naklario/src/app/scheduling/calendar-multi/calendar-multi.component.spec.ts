import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarMultiComponent } from './calendar-multi.component';

describe('CalendarMultiComponent', () => {
  let component: CalendarMultiComponent;
  let fixture: ComponentFixture<CalendarMultiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CalendarMultiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CalendarMultiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
