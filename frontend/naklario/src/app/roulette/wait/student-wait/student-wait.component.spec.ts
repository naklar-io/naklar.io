import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentWaitComponent } from './student-wait.component';

describe('StudentWaitComponent', () => {
  let component: StudentWaitComponent;
  let fixture: ComponentFixture<StudentWaitComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StudentWaitComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StudentWaitComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
