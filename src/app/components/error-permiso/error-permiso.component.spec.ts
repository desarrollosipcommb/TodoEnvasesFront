import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ErrorPermisoComponent } from './error-permiso.component';

describe('ErrorPermisoComponent', () => {
  let component: ErrorPermisoComponent;
  let fixture: ComponentFixture<ErrorPermisoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ErrorPermisoComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ErrorPermisoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
