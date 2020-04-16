import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentExplanationComponent } from './student-explanation.component';

describe('StudentExplanationComponent', () => {
  let component: StudentExplanationComponent;
  let fixture: ComponentFixture<StudentExplanationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentExplanationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentExplanationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
