import { TestBed } from '@angular/core/testing';

import { SubmissionFormService } from './submission-form.service';

describe('SubmissionFormService', () => {
  let service: SubmissionFormService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SubmissionFormService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
