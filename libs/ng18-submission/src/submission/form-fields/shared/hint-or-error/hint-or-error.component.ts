import { Component, InputSignal, input } from '@angular/core';

@Component({
  selector: 'ng18-hint-or-error',
  standalone: true,
  imports: [],
  templateUrl: './hint-or-error.component.html',
  styleUrl: './hint-or-error.component.scss'
})
export class HintOrErrorComponent {
  id: InputSignal<string> = input.required();
  hint: InputSignal<string | undefined> = input();
  error: InputSignal<string | undefined> = input();
  shouldShowError: InputSignal<boolean> = input.required();
}
