import { TestBed } from '@angular/core/testing';

import { EnvaseService } from './envase.service';

describe('EnvaseService', () => {
  let service: EnvaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EnvaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
