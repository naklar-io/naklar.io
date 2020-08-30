import { TestBed } from '@angular/core/testing';

import { ScrollableService } from './scrollable.service';

describe('ScrollableService', () => {
  let service: ScrollableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ScrollableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
