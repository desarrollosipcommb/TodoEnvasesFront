import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProgramarComponent } from './programar.component';

describe('ProgramarComponent', () => {
  let component: ProgramarComponent;
  let fixture: ComponentFixture<ProgramarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ProgramarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProgramarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
