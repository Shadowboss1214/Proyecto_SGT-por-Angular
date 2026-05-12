import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsForm } from './trips-form';

describe('TripsForm', () => {
  let component: TripsForm;
  let fixture: ComponentFixture<TripsForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsForm]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
