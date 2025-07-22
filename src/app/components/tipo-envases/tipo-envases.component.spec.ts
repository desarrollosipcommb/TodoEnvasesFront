import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TipoEnvasesComponent } from './tipo-envases.component';

describe('TipoEnvasesComponent', () => {
  let component: TipoEnvasesComponent;
  let fixture: ComponentFixture<TipoEnvasesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TipoEnvasesComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TipoEnvasesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
