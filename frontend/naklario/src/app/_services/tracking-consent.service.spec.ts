import { TestBed } from '@angular/core/testing';

import { TrackingConsentService } from './tracking-consent.service';

describe('TrackingConsentService', () => {
  let service: TrackingConsentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TrackingConsentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
