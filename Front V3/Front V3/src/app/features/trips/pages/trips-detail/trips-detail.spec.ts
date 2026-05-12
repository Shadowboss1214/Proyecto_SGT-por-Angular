import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TripsDetail } from './trips-detail';

describe('TripsDetail', () => {
  let component: TripsDetail;
  let fixture: ComponentFixture<TripsDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TripsDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TripsDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
