import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PauseModalComponent } from './pause-modal.component';

describe('PauseModalComponent', () => {
  let component: PauseModalComponent;
  let fixture: ComponentFixture<PauseModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PauseModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PauseModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
