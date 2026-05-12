import { TestBed } from '@angular/core/testing';

import { Logistics } from './logistics';

describe('Logistics', () => {
  let service: Logistics;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Logistics);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
