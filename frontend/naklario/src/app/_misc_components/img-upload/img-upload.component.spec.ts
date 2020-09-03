import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ImgUploadComponent } from './img-upload.component';


describe('ImgUploadComponent', () => {
  let component: ImgUploadComponent;
  let fixture: ComponentFixture<ImgUploadComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ ImgUploadComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImgUploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
