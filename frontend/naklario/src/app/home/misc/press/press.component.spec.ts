import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PressComponent } from './press.component';

describe('PressComponent', () => {
  let component: PressComponent;
  let fixture: ComponentFixture<PressComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PressComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PressComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
