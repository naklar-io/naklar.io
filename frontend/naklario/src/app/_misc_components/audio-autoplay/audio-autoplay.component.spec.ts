import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { AudioAutoplayComponent } from './audio-autoplay.component';


describe('AudioAutoplayComponent', () => {
  let component: AudioAutoplayComponent;
  let fixture: ComponentFixture<AudioAutoplayComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ AudioAutoplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AudioAutoplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
