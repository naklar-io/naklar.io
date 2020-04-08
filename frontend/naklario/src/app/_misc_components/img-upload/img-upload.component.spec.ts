import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImgUploadComponent } from './img-upload.component';

describe('ImgUploadComponent', () => {
  let component: ImgUploadComponent;
  let fixture: ComponentFixture<ImgUploadComponent>;

  beforeEach(async(() => {
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
