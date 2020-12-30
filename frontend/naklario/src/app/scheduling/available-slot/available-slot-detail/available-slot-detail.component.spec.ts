import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AvailableSlotDetailComponent } from './available-slot-detail.component';

describe('AvailableSlotDetailComponent', () => {
  let component: AvailableSlotDetailComponent;
  let fixture: ComponentFixture<AvailableSlotDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AvailableSlotDetailComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AvailableSlotDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
