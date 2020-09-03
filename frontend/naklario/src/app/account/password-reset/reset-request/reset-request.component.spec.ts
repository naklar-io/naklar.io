import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { ResetRequestComponent } from './reset-request.component';

describe('ResetRequestComponent', () => {
  let component: ResetRequestComponent;
  let fixture: ComponentFixture<ResetRequestComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ResetRequestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResetRequestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
