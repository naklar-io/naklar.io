import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ParentsComponent } from './parents.component';

describe('ParentsComponent', () => {
  let component: ParentsComponent;
  let fixture: ComponentFixture<ParentsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ParentsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ParentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
