import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MarcacionesComponent } from './marcaciones.component';

describe('MarcacionesComponent', () => {
  let component: MarcacionesComponent;
  let fixture: ComponentFixture<MarcacionesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MarcacionesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MarcacionesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
