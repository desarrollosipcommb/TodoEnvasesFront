import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubirExcelComponent } from './subir-excel.component';

describe('SubirExcelComponent', () => {
  let component: SubirExcelComponent;
  let fixture: ComponentFixture<SubirExcelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SubirExcelComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubirExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
