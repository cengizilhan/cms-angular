import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { CategoryService } from '../../core/services/category.service';
import { BlogCategory } from '../../core/models/blog.model';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { DynamicFormSchema } from '../../core/models/dynamic-form.model';

@Component({
  selector: 'app-category-list',
  standalone: true,
  imports: [
    CommonModule, 
    TableModule, 
    ButtonModule, 
    InputTextModule, 
    ConfirmDialogModule, 
    ToastModule, 
    DialogModule,
    DynamicFormComponent
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './category-list.component.html',
  styleUrl: './category-list.component.scss'
})
export class CategoryListComponent implements OnInit {
  categories: BlogCategory[] = [];
  displayDialog = false;
  isEditMode = false;
  selectedCategoryId: string | null = null;
  categoryData: any = {};
  categorySchema!: DynamicFormSchema;

  constructor(
    private categoryService: CategoryService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadCategories();
    this.initSchema();
  }

  loadCategories(): void {
    this.categories = this.categoryService.getAllCategories();
  }

  initSchema(): void {
    this.categorySchema = {
      submitLabel: this.isEditMode ? 'Update Category' : 'Add Category',
      cancelLabel: 'Cancel',
      fields: [
        { key: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Technology' },
        { key: 'slug', label: 'Slug', type: 'text', placeholder: 'technology (opt)', hint: 'Leave empty for auto-generation' },
        { key: 'description', label: 'Description', type: 'textarea', placeholder: 'Useful descriptions...' }
      ]
    };
  }

  showAddDialog(): void {
    this.isEditMode = false;
    this.selectedCategoryId = null;
    this.categoryData = {};
    this.initSchema();
    this.displayDialog = true;
  }

  editCategory(category: BlogCategory): void {
    this.isEditMode = true;
    this.selectedCategoryId = category.id;
    this.categoryData = { ...category };
    this.initSchema();
    this.displayDialog = true;
  }

  deleteCategory(category: BlogCategory): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete category "${category.name}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const result = this.categoryService.deleteCategory(category.id);
        if (result.success) {
          this.messageService.add({ severity: 'success', summary: 'Success', detail: result.message });
          this.loadCategories();
        } else {
          this.messageService.add({ severity: 'error', summary: 'Error', detail: result.message });
        }
      }
    });
  }

  handleFormSubmit(formValue: any): void {
    let result;
    if (this.isEditMode && this.selectedCategoryId) {
      result = this.categoryService.updateCategory(this.selectedCategoryId, formValue);
    } else {
      result = this.categoryService.addCategory(formValue);
    }

    if (result.success) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: result.message });
      this.displayDialog = false;
      this.loadCategories();
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: result.message });
    }
  }

  onCancel(): void {
    this.displayDialog = false;
  }
}
