import { TestBed } from '@angular/core/testing';

import { TipoLicenciaService } from './tipo-licencia.service';

describe('TipoLicenciaService', () => {
  let service: TipoLicenciaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TipoLicenciaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
