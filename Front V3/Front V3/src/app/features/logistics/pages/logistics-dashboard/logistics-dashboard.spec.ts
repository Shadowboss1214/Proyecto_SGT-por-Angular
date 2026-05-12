import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogisticsDashboard } from './logistics-dashboard';

describe('LogisticsDashboard', () => {
  let component: LogisticsDashboard;
  let fixture: ComponentFixture<LogisticsDashboard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogisticsDashboard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LogisticsDashboard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
