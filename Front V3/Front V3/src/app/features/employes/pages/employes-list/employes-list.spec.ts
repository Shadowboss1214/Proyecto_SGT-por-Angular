import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployesList } from './employes-list';

describe('EmployesList', () => {
  let component: EmployesList;
  let fixture: ComponentFixture<EmployesList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployesList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployesList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
