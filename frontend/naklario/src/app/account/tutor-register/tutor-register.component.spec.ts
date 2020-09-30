import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TutorRegisterComponent } from './tutor-register.component';

describe('TutorRegisterComponent', () => {
  let component: TutorRegisterComponent;
  let fixture: ComponentFixture<TutorRegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TutorRegisterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TutorRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
