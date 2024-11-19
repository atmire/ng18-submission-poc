import { Component, Input, OnInit, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NgForOf } from '@angular/common';
import { Operation } from 'fast-json-patch/commonjs/core';
import { SubmissionSection } from './models';
import { SubmissionFormComponent } from './submission-form/submission-form.component';

@Component({
  selector: 'ng18-submission',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    NgForOf,
    SubmissionFormComponent
  ],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.scss'
})
export class SubmissionComponent {
  // I'm using legacy @Inputs and @Outputs here for compatibility with angular elements in angular 17
  @Input() model: SubmissionSection;
  @Input() wsi: any;
  @Output() submit: EventEmitter<Operation[]> = new EventEmitter();

  constructor() {
    document.dispatchEvent(new Event('ng18-submission-loaded'));
  }

  ngOnInit() {
    console.log('model',this.model);
    console.log('wsi',this.wsi);
  }


  ngOnChanges(changes: SimpleChanges) {
    console.log('changes', changes);

  }
  onSubmit(patch: Operation[]) {
    this.submit.emit(patch);
  }
}
