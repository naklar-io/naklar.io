import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TutorComponent } from './tutor.component';

describe('TutorComponent', () => {
  let component: TutorComponent;
  let fixture: ComponentFixture<TutorComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
