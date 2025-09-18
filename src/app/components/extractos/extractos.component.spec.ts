import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExtractosComponent } from './extractos.component';

describe('ExtractosComponent', () => {
  let component: ExtractosComponent;
  let fixture: ComponentFixture<ExtractosComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ExtractosComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExtractosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
