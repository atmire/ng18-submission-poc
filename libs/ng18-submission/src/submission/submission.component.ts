import { Component, Input } from '@angular/core';

@Component({
  selector: 'ng18-submission',
  standalone: true,
  imports: [],
  templateUrl: './submission.component.html',
  styleUrl: './submission.component.scss'
})
export class SubmissionComponent {
  @Input() model: any
}
