import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { FormsModule } from '@angular/forms';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost } from '../../core/models/blog.model';

@Component({
  selector: 'app-public-blog-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TagModule,
    FormsModule
  ],
  templateUrl: './blog-list.component.html',
  styleUrl: './blog-list.component.scss'
})
export class PublicBlogListComponent implements OnInit {
  posts: BlogPost[] = [];
  filteredPosts: BlogPost[] = [];
  searchTerm = '';
  selectedCategory = '';
  categories: string[] = [];

  constructor(private blogService: BlogService, private router: Router) {}

  ngOnInit(): void {
    this.loadPosts();
    this.categories = this.blogService.getAllCategories();
  }

  loadPosts(): void {
    this.posts = this.blogService.getPublishedPosts();
    this.applyFilters();
  }

  applyFilters(): void {
    let filtered = [...this.posts];

    if (this.selectedCategory) {
      filtered = filtered.filter(post => post.categories.includes(this.selectedCategory));
    }

    if (this.searchTerm) {
      const searchLower = this.searchTerm.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower)
      );
    }

    this.filteredPosts = filtered;
  }

  onSearch(): void {
    this.applyFilters();
  }

  filterByCategory(category: string): void {
    this.selectedCategory = this.selectedCategory === category ? '' : category;
    this.applyFilters();
  }

  viewPost(slug: string): void {
    this.router.navigate(['/blog', slug]);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
