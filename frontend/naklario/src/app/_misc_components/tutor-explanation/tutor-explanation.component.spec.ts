import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorExplanationComponent } from './tutor-explanation.component';

describe('TutorExplanationComponent', () => {
  let component: TutorExplanationComponent;
  let fixture: ComponentFixture<TutorExplanationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TutorExplanationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorExplanationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
