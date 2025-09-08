import { TestBed } from '@angular/core/testing';

import { SubirExcelService } from './subir-excel.service';

describe('SubirExcelService', () => {
  let service: SubirExcelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubirExcelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
