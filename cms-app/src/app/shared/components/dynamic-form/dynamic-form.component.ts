import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DynamicFormSchema, FormFieldSchema } from '../../../core/models/dynamic-form.model';

// PrimeNG Imports
import { InputTextModule } from 'primeng/inputtext';
import { InputTextarea } from 'primeng/inputtextarea';
import { EditorModule } from 'primeng/editor';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { MessageModule } from 'primeng/message';

@Component({
  selector: 'app-dynamic-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextarea,
    EditorModule,
    ButtonModule,
    DropdownModule,
    CalendarModule,
    MessageModule
  ],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit {
  @Input() schema!: DynamicFormSchema;
  @Input() data: any = {};
  @Input() loading = false;
  
  @Output() formSubmit = new EventEmitter<any>();
  @Output() formCancel = new EventEmitter<void>();

  form!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.createForm();
  }

  createForm(): void {
    const group: any = {};

    this.schema.fields.forEach(field => {
      let value = this.data[field.key] !== undefined ? this.data[field.key] : (field.defaultValue || '');
      
      // Handle comma-separated strings for chips-like behavior
      if (field.type === 'chips' && Array.isArray(value)) {
        value = value.join(', ');
      }

      const validators = field.validators || [];
      if (field.required) {
        validators.push(Validators.required);
      }

      group[field.key] = [value, validators];
    });

    this.form = this.fb.group(group);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.markFormGroupTouched(this.form);
      return;
    }

    const formValue = { ...this.form.value };
    
    // Reverse mapping for chips (string -> array)
    this.schema.fields.forEach(field => {
      if (field.type === 'chips' && typeof formValue[field.key] === 'string') {
        formValue[field.key] = formValue[field.key]
          .split(',')
          .map((v: string) => v.trim())
          .filter((v: string) => v.length > 0);
      }
    });

    this.formSubmit.emit(formValue);
  }

  onCancel(): void {
    this.formCancel.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getControl(key: string) {
    return this.form.get(key);
  }

  isInvalid(key: string): boolean {
    const control = this.getControl(key);
    return !!(control && control.invalid && control.touched);
  }
}
