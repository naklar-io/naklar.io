import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { StudentExplanationComponent } from './student-explanation.component';


describe('StudentExplanationComponent', () => {
  let component: StudentExplanationComponent;
  let fixture: ComponentFixture<StudentExplanationComponent>;

  beforeEach(waitForAsync(() => {
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
