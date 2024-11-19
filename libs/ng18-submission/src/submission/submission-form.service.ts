import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Form, FormControl, Validators } from '@angular/forms';
import {
  SubmissionField,
  SubmissionSection,
  SubmissionRow,
  WorkspaceItem,
  MetadataValue
} from './models';
import { Operation } from 'fast-json-patch/commonjs/core';
import { compare } from 'fast-json-patch';

@Injectable({
  providedIn: 'root'
})
export class SubmissionFormService {

  // constructor(protected formBuilder: FormBuilder) {
  // }

  initFormGroup(sections: SubmissionSection[], wsi: WorkspaceItem): FormGroup {
    console.log('sections', sections);
    const allSectionGroups: any = {};
    sections.forEach((section: SubmissionSection) => {
      const sectionFields = section.rows
        .map((row: SubmissionRow) => row.fields)
        .reduce((output: SubmissionField[], next: SubmissionField[]) => [...output, ...next]);       ;

      const sectionGroup: any = {};

      sectionFields.forEach((field: SubmissionField) => {
        const currentValues: MetadataValue[] = wsi?.sections[section?.name][field?.selectableMetadata[0]?.metadata];
        let value;
        if (currentValues?.length > 0) {
          value = currentValues[0];
        }

        sectionGroup[field.formControlName] = field.mandatory
          ? new FormControl(value, Validators.required)
          : new FormControl(value);
      });

      allSectionGroups[section.name] = new FormGroup(sectionGroup)
    })
    return new FormGroup(allSectionGroups);
  }


  instantiateFields(section: SubmissionSection): SubmissionSection {
    section.rows = section.rows.map((row: SubmissionRow) => ({
      fields: row.fields
        .map((field: SubmissionField) => {
          return Object.assign(new SubmissionField(), field, {
            // TODO this should move to the backend
            id: field.selectableMetadata[0].metadata
          })
        })
    }));

    return section;
  }

  getPatch(initialValue: Partial<WorkspaceItem>, submissionForm: FormGroup): Operation[] {
    const currentValue: Partial<WorkspaceItem> = {};

    Object.entries(submissionForm.value).forEach(([sectionName, section]: [string, any]) => {
      Object.entries(section)
        .filter(([, field]: [string, any]) => field !== null)
        .forEach(([fieldName, field]: [string, any]) => {
          if (currentValue.sections === undefined) {
            currentValue.sections = {};
          }
          if (currentValue.sections[sectionName] === undefined) {
            currentValue.sections[sectionName] = {};
          }
          currentValue.sections[sectionName][fieldName.replaceAll('_', '.')] = [field];
        })
    })

    return compare(initialValue, currentValue);
  }

}
