import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableSlotListComponent } from './available-slot-list.component';

describe('AvailableSlotListComponent', () => {
  let component: AvailableSlotListComponent;
  let fixture: ComponentFixture<AvailableSlotListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableSlotListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableSlotListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
