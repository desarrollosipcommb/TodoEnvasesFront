import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExportarProgramacionesComponent } from './exportar-programaciones.component';

describe('ExportarProgramacionesComponent', () => {
  let component: ExportarProgramacionesComponent;
  let fixture: ComponentFixture<ExportarProgramacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExportarProgramacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExportarProgramacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
