import { createApplication } from '@angular/platform-browser';
import { appConfig } from './main.config';
import { createCustomElement } from '@angular/elements';
import { ApplicationRef } from '@angular/core';
import { SubmissionComponent } from './submission/submission.component';

(async () => {
  const app: ApplicationRef = await createApplication(appConfig);

  // Define Web Components
  const submissionComponent = createCustomElement(SubmissionComponent, { injector: app.injector });
  customElements.define('ng18-submission', submissionComponent);
})();
