import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NotificationTimeRangeComponent } from './notification-time-range.component';

describe('NotificationTimeRangeComponent', () => {
  let component: NotificationTimeRangeComponent;
  let fixture: ComponentFixture<NotificationTimeRangeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotificationTimeRangeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationTimeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
