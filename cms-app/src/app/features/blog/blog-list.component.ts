import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost, BlogStatus } from '../../core/models/blog.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class BlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  searchTerm = '';
  selectedStatus: BlogStatus | 'all' = 'all';

  statusOptions = [
    { label: 'All', value: 'all' },
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Archived', value: 'archived' }
  ];

  constructor(
    private blogService: BlogService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.posts = this.blogService.getAllPosts();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    // Filter by status
    if (this.selectedStatus !== 'all') {
      filtered = filtered.filter(post => post.status === this.selectedStatus);
    }

    // Filter by search term
    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.author.username.toLowerCase().includes(searchLower)
      );
    }

    this.filteredPosts = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  createNewPost(): void {
    this.router.navigate(['/dashboard/blogs/new']);
  }

  editPost(post: BlogPost): void {
    this.router.navigate(['/dashboard/blogs', post.id, 'edit']);
  }

  deletePost(post: BlogPost): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${post.title}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const result = this.blogService.deletePost(post.id);
        if (result.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: result.message
          });
          this.loadPosts();
        } else {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: result.message
          });
        }
      }
    });
  }

  getStatusSeverity(status: BlogStatus): 'success' | 'secondary' | 'info' | 'warn' | 'danger' {
    switch (status) {
      case 'published':
        return 'success';
      case 'draft':
        return 'warn';
      case 'archived':
        return 'secondary';
      default:
        return 'info';
    }
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
}
