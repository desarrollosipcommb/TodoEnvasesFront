import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompatibilidadesComponent } from './compatibilidades.component';

describe('CompatibilidadesComponent', () => {
  let component: CompatibilidadesComponent;
  let fixture: ComponentFixture<CompatibilidadesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CompatibilidadesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompatibilidadesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
