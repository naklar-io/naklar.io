import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { HelpSupportComponent } from './help-support.component';

describe('HelpSupportComponent', () => {
  let component: HelpSupportComponent;
  let fixture: ComponentFixture<HelpSupportComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ HelpSupportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HelpSupportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
