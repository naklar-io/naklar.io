import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MoreInformationComponent } from './more-information.component';

describe('MoreInformationComponent', () => {
  let component: MoreInformationComponent;
  let fixture: ComponentFixture<MoreInformationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MoreInformationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MoreInformationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
