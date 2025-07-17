import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsuarioTabletComponent } from './usuario-tablet.component';

describe('UsuarioTabletComponent', () => {
  let component: UsuarioTabletComponent;
  let fixture: ComponentFixture<UsuarioTabletComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsuarioTabletComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsuarioTabletComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
