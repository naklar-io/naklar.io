import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorWaitComponent } from './tutor-wait.component';

describe('TutorWaitComponent', () => {
  let component: TutorWaitComponent;
  let fixture: ComponentFixture<TutorWaitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorWaitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
