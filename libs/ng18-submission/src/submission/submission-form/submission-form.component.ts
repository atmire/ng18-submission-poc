import {
  Component,
  OnInit,
  input,
  InputSignal,
  computed,
  Signal,
  output,
  effect
} from '@angular/core';
import { FormGroup, ReactiveFormsModule, ValueChangeEvent } from '@angular/forms';
import { compare } from 'fast-json-patch';
import { SubmissionSection, WorkspaceItem } from '../models';
import { SubmissionFormService } from '../submission-form.service';
import {
  SubmissionFieldLoaderComponent
} from '../submission-field-loader/submission-field-loader.component';
import { Operation } from 'fast-json-patch/commonjs/core';

@Component({
  selector: 'ng18-submission-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    SubmissionFieldLoaderComponent,
  ],
  templateUrl: './submission-form.component.html',
  styleUrl: './submission-form.component.scss'
})
export class SubmissionFormComponent implements OnInit {
  submissionForm: FormGroup;
  section: InputSignal<SubmissionSection> = input.required( {
    transform: (value: SubmissionSection) => this.submissionFormService.instantiateFields(value),
  });

  wsi: InputSignal<WorkspaceItem> = input.required();

  submit = output<Operation[]>()

  protected initialValue: Signal<Partial<WorkspaceItem>> = computed(() => {
    return {
      sections: {
        [this.section()?.name]: this.wsi()?.sections[this.section()?.name]
      }
    };
  })


  constructor(
    protected submissionFormService: SubmissionFormService
  ) {
  }

  ngOnInit(): void {
    this.submissionForm = this.submissionFormService.initFormGroup([this.section()], this.wsi());

    // Auto-save every second. You don't lose focus if you're typing
    // setInterval(() => this.performSubmit(), 1000);
  }

  onSubmit(event: SubmitEvent) {
    // prevent the HTML form submit event from bubbling up
    event.stopImmediatePropagation();
    this.performSubmit();
  }

  performSubmit() {
    const patch = this.submissionFormService.getPatch(this.initialValue(), this.submissionForm);
    if (patch !== undefined && patch.length > 0) {
      this.submit.emit(patch);
    }
  }
}
