import { TestBed } from '@angular/core/testing';

import { TipoEnvaseService } from './tipo-envase.service';

describe('TipoEnvaseService', () => {
  let service: TipoEnvaseService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoEnvaseService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
