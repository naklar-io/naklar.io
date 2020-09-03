import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { NumbersComponent } from './numbers.component';

describe('NumbersComponent', () => {
  let component: NumbersComponent;
  let fixture: ComponentFixture<NumbersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ NumbersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
