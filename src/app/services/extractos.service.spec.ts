import { TestBed } from '@angular/core/testing';

import { ExtractosService } from './extractos.service';

describe('ExtractosService', () => {
  let service: ExtractosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ExtractosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
