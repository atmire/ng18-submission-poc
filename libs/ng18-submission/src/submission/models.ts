import {
  ValidatorFn,
  FormControl,
  FormBuilder,
  ControlValueAccessor,
  Validator,
  AbstractControl,
  FormGroup,
  ValidationErrors,
  ControlEvent,
  TouchedChangeEvent,
  ValueChangeEvent, Validators
} from '@angular/forms';
import { InputSignal, input, OnInit, OnDestroy, Directive } from '@angular/core';
import { SubmissionFormService } from './submission-form.service';
import { Subscription, filter, tap, map } from 'rxjs';

// https://www.typescriptlang.org/docs/handbook/enums.html#objects-vs-enums
const submissionFormInputType =  {
  Name: 'name',
  Onebox: 'onebox',
  Date: 'date',
  Series: 'series',
  Tag: 'tag',
  Textarea: 'textarea',
} as const;
export type SubmissionFormInputType = typeof submissionFormInputType[keyof typeof submissionFormInputType];

export interface SubmissionFormInput {
  type: SubmissionFormInputType;
  regex: string;
}

export interface LanguageFormField {
  /**
   * The value to present to the user
   */
  display: string;

  /**
   * The internal iso code to store in the database
   */
  code: string
}

export interface SelectableMetadata {
  metadata: string;
  label: string;
  controlledVocabulary?: string;
  closed?: boolean;
}

const submissionScope = {
  Submission: 'submission',
  Workflow: 'workflow',
} as const;
export type SubmissionScope = typeof submissionScope[keyof typeof submissionScope];

export interface SelectableRelationship {
  relationshipType: string;
  filter: string;
  searchConfiguration: string;
  nameVariants: string;
  externalSources: string[];
}

const submissionVisibility = {
  Hidden: 'hidden',
  ReadOnly: 'read-only',
  Editable: 'editable'
} as const;
export type SubmissionVisibility = typeof submissionVisibility[keyof typeof submissionVisibility];


export class SubmissionField {
  id: string;
  get formControlName(): string {
    return this.id.replaceAll('.', '_');
  }
  hints: string;
  input: SubmissionFormInput;
  label: string;
  languageCodes: LanguageFormField[];
  mandatory: boolean;
  repeatable: boolean;
  // If there's more than one entry in selectableMetadata it means the user can choose which field
  // they want to save the values to, e.g. the identifier fields
  selectableMetadata: SelectableMetadata[];
  typeBind: string[];
  scope: SubmissionScope;
  selectableRelationship: SelectableRelationship;
  mandatoryMessage: string;
  style: string;
  visibility: SubmissionVisibility;
}

export interface SubmissionRow {
  fields: SubmissionField[];
}


export interface SubmissionSection {
  name: string,
  rows: SubmissionRow[];
}

@Directive()
export abstract class AbstractSubmissionFieldComponent implements OnInit, OnDestroy, ControlValueAccessor, Validator {
  field: InputSignal<SubmissionField>;
  section: InputSignal<SubmissionSection>;
  wsi: InputSignal<WorkspaceItem>;

  subs: Subscription[] = [];

  customFieldForm: FormGroup

  protected mdv: MetadataValue;

  constructor(
    protected formBuilder: FormBuilder,
    protected submissionFormService: SubmissionFormService
  ) {
  }

  ngOnInit(): void {
  }

  ngOnDestroy(): void {
    this.subs
      .filter((sub: Subscription) => sub !== null && sub !== undefined)
      .forEach((sub: Subscription) => sub.unsubscribe());
  }

  registerOnChange(onChange: any): void {
    const sub = this.customFieldForm.events.pipe(
      filter((event: ControlEvent<any>) => event instanceof ValueChangeEvent),
      map(() => this.value)
    ).subscribe(onChange);
    this.subs.push(sub);
  }

  abstract set value(MetadataValue: MetadataValue)
  abstract get value(): MetadataValue

  registerOnTouched(onTouched: any): void {
    const sub = this.customFieldForm.events.pipe(
      filter((event: ControlEvent<any>) => event instanceof TouchedChangeEvent)
    ).subscribe(onTouched);
    this.subs.push(sub);
  }

  setDisabledState(disabled: boolean): void {
    if (disabled === true) {
      this.customFieldForm.disable();
    }
    else {
      this.customFieldForm.enable();
    }
  }

  writeValue(metadataValue: MetadataValue) {
    if (metadataValue) {
      this.value = metadataValue;
    }
  }

  abstract validate(control: AbstractControl): ValidationErrors | null

  addControlErrors(allErrors: ValidationErrors, controlName: string): ValidationErrors {

    const errors = { ...allErrors };

    const controlErrors = this.customFieldForm.controls[controlName].errors;

    if (controlErrors) {
      errors[controlName] = controlErrors;
    }

    return errors;
  }
}

export interface WorkspaceItem {
  errors: { message: string, paths: string[] }[]
  sections: {
    [step: string]: MetadataMap
  }
}


/** A single metadata value and its properties. */
export interface MetadataValueInterface {

  /** The language. */
  language: string;

  /** The string value. */
  value: string;
}

/** A map of metadata keys to an ordered list of MetadataValue objects. */
export interface MetadataMapInterface {
  [key: string]: MetadataValueInterface[];
}

/** A map of metadata keys to an ordered list of MetadataValue objects. */
export class MetadataMap implements MetadataMapInterface {
  [key: string]: MetadataValue[];
}

/** A single metadata value and its properties. */
export class MetadataValue implements MetadataValueInterface {
  /** The language. */
  language: string;

  /** The string value. */
  value: string;

  /**
   * The place of this MetadataValue within its list of metadata
   * This is used to render metadata in a specific custom order
   */
  place: number;

  /** The authority key used for authority-controlled metadata */
  authority: string;

  /** The authority confidence value */
  confidence: number;

  constructor() {

  }
}
