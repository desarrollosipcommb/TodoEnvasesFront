import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TiposLicenciasComponent } from './tipos-licencias.component';

describe('TiposLicenciasComponent', () => {
  let component: TiposLicenciasComponent;
  let fixture: ComponentFixture<TiposLicenciasComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TiposLicenciasComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TiposLicenciasComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
