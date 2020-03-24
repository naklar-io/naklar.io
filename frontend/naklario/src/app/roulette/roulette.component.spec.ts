import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RouletteComponent } from './roulette.component';

describe('RouletteComponent', () => {
  let component: RouletteComponent;
  let fixture: ComponentFixture<RouletteComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RouletteComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RouletteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
