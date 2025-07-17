import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReporteHorasComponent } from './reporte-horas.component';

describe('ReporteHorasComponent', () => {
  let component: ReporteHorasComponent;
  let fixture: ComponentFixture<ReporteHorasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReporteHorasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReporteHorasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
