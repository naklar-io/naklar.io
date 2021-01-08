import { TestBed } from '@angular/core/testing';

import { AvailableSlotService } from './available-slot.service';

describe('AvailableSlotService', () => {
  let service: AvailableSlotService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AvailableSlotService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
