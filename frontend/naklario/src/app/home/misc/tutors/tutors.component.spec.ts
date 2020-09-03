import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TutorsComponent } from './tutors.component';

describe('TutorsComponent', () => {
  let component: TutorsComponent;
  let fixture: ComponentFixture<TutorsComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
