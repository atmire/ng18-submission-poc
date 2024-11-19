import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OneboxFieldComponent } from './onebox-field.component';

describe('OneboxFieldComponent', () => {
  let component: OneboxFieldComponent;
  let fixture: ComponentFixture<OneboxFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OneboxFieldComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OneboxFieldComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
