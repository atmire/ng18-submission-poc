import { Component, InputSignal, input, forwardRef } from '@angular/core';
import {
  AbstractSubmissionFieldComponent,
  SubmissionField,
  WorkspaceItem,
  MetadataValue, SubmissionSection
} from '../../models';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ValidationErrors,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  NG_VALUE_ACCESSOR,
  NG_VALIDATORS,
  ControlEvent,
  ValueChangeEvent
} from '@angular/forms';
import { SubmissionFormService } from '../../submission-form.service';
import { HintOrErrorComponent } from '../shared/hint-or-error/hint-or-error.component';
import { filter, map } from 'rxjs';

@Component({
  selector: 'ng18-onebox-field',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    HintOrErrorComponent
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => OneboxFieldComponent)
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: forwardRef(() => OneboxFieldComponent)
    },
  ],
  templateUrl: './onebox-field.component.html',
  styleUrl: './onebox-field.component.scss'
})
export class OneboxFieldComponent extends AbstractSubmissionFieldComponent {
  override field: InputSignal<SubmissionField> = input.required();
  override section: InputSignal<SubmissionSection> = input.required();
  override wsi: InputSignal<WorkspaceItem> = input.required();
  override customFieldForm: FormGroup;

  constructor(
    protected override formBuilder: FormBuilder,
    protected override submissionFormService: SubmissionFormService
  ) {
    super(formBuilder, submissionFormService);
  }


  override ngOnInit() {
    super.ngOnInit();
    this.customFieldForm = this.formBuilder.group({
      // The value is an empty string here. It will get initialized with the value from the wsi by a
      // setValue call from SubmissionFormService.initFormGroup()
      onebox: ['', this.field().mandatory ? [Validators.required] : []]
    })

    //TODO test repeatable field, buggy atm, non repeatable code in comments above works

    // this.customFieldForm = this.formBuilder.group({
    //   onebox: this.formBuilder.array([
    //     this.formBuilder.control(value)
    //   ], this.field().mandatory ? [Validators.required] : []),
    // })
  }

  get onebox() {
    return this.customFieldForm.get('onebox');
  }

  set value(metadataValue: MetadataValue) {
    this.mdv = metadataValue;
    this.customFieldForm.setValue({
      onebox: metadataValue.value
    }, { emitEvent: false });
  }

  get value(): MetadataValue {
    return Object.assign(new MetadataValue(), this.mdv, {
      value: this.customFieldForm.get('onebox')?.value
    });
  }

  override validate(control: AbstractControl): ValidationErrors | null {
    if (this.customFieldForm.valid) {
      return null;
    } else {
      return this.addControlErrors({}, 'onebox')
    }
  }
}
