import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JoinTheCommunityComponent } from './join-the-community.component';

describe('JoinTheCommunityComponent', () => {
  let component: JoinTheCommunityComponent;
  let fixture: ComponentFixture<JoinTheCommunityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JoinTheCommunityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JoinTheCommunityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
