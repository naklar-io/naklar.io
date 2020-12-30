import { TestBed } from '@angular/core/testing';

import { TimeslotService } from './timeslot.service';

describe('TimeslotService', () => {
  let service: TimeslotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeslotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
