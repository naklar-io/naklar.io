import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { InstructionVideoComponent } from './instruction-video.component';

describe('InstructionVideoComponent', () => {
  let component: InstructionVideoComponent;
  let fixture: ComponentFixture<InstructionVideoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ InstructionVideoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(InstructionVideoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
