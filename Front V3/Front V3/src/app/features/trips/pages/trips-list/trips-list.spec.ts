import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsListComponent } from './trips-list';

describe('TripsListComponent', () => {
  let component: TripsListComponent;
  let fixture: ComponentFixture<TripsListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsListComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
