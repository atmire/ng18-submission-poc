import { Component, InputSignal, input } from '@angular/core';
import { SubmissionField, WorkspaceItem, SubmissionSection } from '../models';
import { DateFieldComponent } from '../form-fields/date-field/date-field.component';
import { OneboxFieldComponent } from '../form-fields/onebox-field/onebox-field.component';
import { FormGroup, ReactiveFormsModule, FormGroupName, ControlContainer } from '@angular/forms';

@Component({
  selector: 'ng18-submission-field-loader',
  standalone: true,
  imports: [
    DateFieldComponent,
    OneboxFieldComponent,
    ReactiveFormsModule
  ],
  templateUrl: './submission-field-loader.component.html',
  styleUrl: './submission-field-loader.component.scss',
  viewProviders: [{ provide: ControlContainer, useExisting: FormGroupName }],
})
export class SubmissionFieldLoaderComponent {
  field: InputSignal<SubmissionField> = input.required();
  section: InputSignal<SubmissionSection> = input.required();
  wsi: InputSignal<WorkspaceItem> = input.required();
}
