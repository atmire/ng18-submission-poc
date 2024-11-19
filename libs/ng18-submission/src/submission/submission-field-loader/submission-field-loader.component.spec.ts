import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubmissionFieldLoaderComponent } from './submission-field-loader.component';

describe('SubmissionFieldLoaderComponent', () => {
  let component: SubmissionFieldLoaderComponent;
  let fixture: ComponentFixture<SubmissionFieldLoaderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SubmissionFieldLoaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubmissionFieldLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
