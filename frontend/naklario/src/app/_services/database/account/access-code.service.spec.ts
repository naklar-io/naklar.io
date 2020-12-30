import { TestBed } from '@angular/core/testing';

import { AccessCodeService } from './access-code.service';

describe('AccessCodeService', () => {
  let service: AccessCodeService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AccessCodeService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
