import { ValidatorFn } from '@angular/forms';

export type FieldType = 'text' | 'textarea' | 'editor' | 'select' | 'chips' | 'calendar' | 'number' | 'password';

export interface FormFieldSchema {
  key: string;
  label: string;
  type: FieldType;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  validators?: ValidatorFn[];
  options?: { label: string; value: any }[]; // For select dropdowns
  className?: string; // For layout grid, e.g., 'col-6'
  defaultValue?: any;
}

export interface DynamicFormSchema {
  fields: FormFieldSchema[];
  submitLabel?: string;
  cancelLabel?: string;
}
