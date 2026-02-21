import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { BlogService } from '../../core/services/blog.service';
import { DynamicFormComponent } from '../../shared/components/dynamic-form/dynamic-form.component';
import { DynamicFormSchema } from '../../core/models/dynamic-form.model';

import { CategoryService } from '../../core/services/category.service';

@Component({
  selector: 'app-blog-form',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ToastModule,
    DynamicFormComponent
  ],
  providers: [MessageService],
  templateUrl: './blog-form.component.html',
  styleUrl: './blog-form.component.scss'
})
export class BlogFormComponent implements OnInit {
  isEditMode = false;
  postId: string | null = null;
  loading = false;
  postData: any = {};
  schema!: DynamicFormSchema;

  constructor(
    private blogService: BlogService,
    private categoryService: CategoryService, // New
    private router: Router,
    private route: ActivatedRoute,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.postId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.postId;
    
    if (this.isEditMode) {
      this.loadPost();
    }
    
    this.initSchema();
  }

  initSchema(): void {
    const categories = this.categoryService.getAllCategories().map(c => ({ label: c.name, value: c.name }));

    this.schema = {
      submitLabel: this.isEditMode ? 'Update Post' : 'Create Post',
      cancelLabel: 'Cancel',
      fields: [
        // ... previous fields
        { 
          key: 'title', 
          label: 'Title', 
          type: 'text', 
          required: true, 
          validators: [Validators.minLength(3)],
          placeholder: 'Enter post title'
        },
        { 
          key: 'excerpt', 
          label: 'Excerpt', 
          type: 'textarea', 
          required: true, 
          validators: [Validators.minLength(10)],
          placeholder: 'Brief summary of the post'
        },
        { 
          key: 'content', 
          label: 'Content', 
          type: 'editor', 
          required: true, 
          validators: [Validators.minLength(50)]
        },
        { 
          key: 'featuredImage', 
          label: 'Featured Image URL', 
          type: 'text', 
          placeholder: 'https://example.com/image.jpg',
          hint: 'Enter a URL for the featured image (optional)'
        },
        { 
          key: 'categories', 
          label: 'Categories', 
          type: 'chips', // We'll keep it as chips for now but user can see existing ones if we add a hint
          required: true, 
          placeholder: 'Technology, Tutorial',
          hint: 'Existing: ' + categories.map(c => c.label).join(', ')
        },
        { 
          key: 'tags', 
          label: 'Tags', 
          type: 'chips', 
          placeholder: 'angular, cms',
          hint: 'Enter tags separated by commas (optional)'
        },
        { 
          key: 'status', 
          label: 'Status', 
          type: 'select', 
          required: true,
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Published', value: 'published' },
            { label: 'Archived', value: 'archived' }
          ],
          defaultValue: 'draft'
        },
        { 
          key: 'publishedAt', 
          label: 'Publish Date', 
          type: 'calendar',
          hint: 'Leave empty for immediate publish'
        }
      ]
    };
  }

  loadPost(): void {
    if (!this.postId) return;
    const post = this.blogService.getPostById(this.postId);
    
    if (!post) {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Post not found' });
      this.router.navigate(['/dashboard/blogs']);
      return;
    }

    this.postData = {
      ...post,
      publishedAt: post.publishedAt ? new Date(post.publishedAt) : null
    };
  }

  handleFormSubmit(formValue: any): void {
    this.loading = true;

    // Auto-set publishedAt if status is published and not set
    if (formValue.status === 'published' && !formValue.publishedAt) {
      formValue.publishedAt = new Date();
    }

    if (this.isEditMode && this.postId) {
      const result = this.blogService.updatePost({ id: this.postId, ...formValue });
      this.handleResult(result);
    } else {
      const result = this.blogService.createPost(formValue);
      this.handleResult(result);
    }
  }

  private handleResult(result: { success: boolean; message: string }): void {
    this.loading = false;
    if (result.success) {
      this.messageService.add({ severity: 'success', summary: 'Success', detail: result.message });
      setTimeout(() => this.router.navigate(['/dashboard/blogs']), 1000);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Error', detail: result.message });
    }
  }

  onCancel(): void {
    this.router.navigate(['/dashboard/blogs']);
  }
}

