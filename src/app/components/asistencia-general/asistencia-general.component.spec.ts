import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsistenciaGeneralComponent } from './asistencia-general.component';

describe('AsistenciaGeneralComponent', () => {
  let component: AsistenciaGeneralComponent;
  let fixture: ComponentFixture<AsistenciaGeneralComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AsistenciaGeneralComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsistenciaGeneralComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
