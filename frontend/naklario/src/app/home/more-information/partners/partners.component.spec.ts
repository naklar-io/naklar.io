import { async, ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PartnersComponent } from './partners.component';

describe('PartnersComponent', () => {
  let component: PartnersComponent;
  let fixture: ComponentFixture<PartnersComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ PartnersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PartnersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
