import {
  Component,
  InputSignal,
  input,
  computed,
  Signal,
  OnInit,
  OnDestroy,
  forwardRef
} from '@angular/core';
import {
  AbstractSubmissionFieldComponent,
  SubmissionField,
  WorkspaceItem,
  MetadataValue, SubmissionSection,
} from '../../models';
import {
  FormBuilder,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlValueAccessor,
  Validator,
  Validators,
  FormGroup,
  AbstractControl,
  ReactiveFormsModule,
  ValidationErrors, ValueChangeEvent
} from '@angular/forms';
import { SubmissionFormService } from '../../submission-form.service';
import { HintOrErrorComponent } from '../shared/hint-or-error/hint-or-error.component';

const DATE_REGEX = /^(\d{4})-?(\d{2})?-?(\d{2})?.*$/;

@Component({
  selector: 'ng18-date-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HintOrErrorComponent
  ],
  templateUrl: './date-field.component.html',
  styleUrl: './date-field.component.scss',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => DateFieldComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => DateFieldComponent)
    }
  ]
})
export class DateFieldComponent extends AbstractSubmissionFieldComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  override field: InputSignal<SubmissionField> = input.required();
  override section: InputSignal<SubmissionSection> = input.required();
  override wsi: InputSignal<WorkspaceItem> = input.required();
  override customFieldForm: FormGroup

  constructor(
    protected override formBuilder: FormBuilder,
    protected override submissionFormService: SubmissionFormService
  ) {
    super(formBuilder, submissionFormService);
  }

  override ngOnInit() {
    super.ngOnInit();
    this.customFieldForm = this.formBuilder.group({
      // The values are empty strings here. They will get initialized with the values from the wsi
      // by a setValue call from SubmissionFormService.initFormGroup()
      year: ['', [Validators.required]],
      month: ['', []],
      day: ['', []],
    })

  }

  set value(metadataValue: MetadataValue) {
    this.mdv = metadataValue;

    const matches = metadataValue.value.match(DATE_REGEX);

    if (matches !== null) {
      this.customFieldForm.setValue({
        year: matches[1]?.padStart(4, '0') || '',
        month: matches[2]?.padStart(2, '0') || '',
        day: matches[3]?.padStart(2, '0') || ''
      }, { emitEvent: false });
    }
  }

  get value(): MetadataValue {
    const year = `${this.customFieldForm.value.year}`.padStart(4, '0');
    const month = `${this.customFieldForm.value.month}`.padStart(2, '0');
    const day = `${this.customFieldForm.value.day}`.padStart(2, '0');
    return Object.assign(new MetadataValue(), this.mdv, {
      value: `${year}-${month}-${day}`
    })
  }

  override validate(control: AbstractControl) {

    if (this.customFieldForm.valid) {
      return null;
    }

    let errors : ValidationErrors = {};

    errors = this.addControlErrors(errors, 'year');
    errors = this.addControlErrors(errors, 'month');
    errors = this.addControlErrors(errors, 'day');

    return errors;
  }
}
