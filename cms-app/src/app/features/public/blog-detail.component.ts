import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { BlogService } from '../../core/services/blog.service';
import { BlogPost } from '../../core/models/blog.model';

@Component({
  selector: 'app-public-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonModule, TagModule],
  templateUrl: './blog-detail.component.html',
  styleUrl: './blog-detail.component.scss'
})
export class PublicBlogDetailComponent implements OnInit {
  post: BlogPost | undefined;
  relatedPosts: BlogPost[] = [];

  constructor(
    private route: ActivatedRoute,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const slug = params.get('slug');
      if (slug) {
        this.loadPost(slug);
      }
    });
  }

  loadPost(slug: string): void {
    this.post = this.blogService.getPostBySlug(slug);
    
    if (!this.post) {
      this.router.navigate(['/blog']);
      return;
    }

    // Increment view count
    this.blogService.incrementViewCount(this.post.id);

    // Get related posts (same category, excluding current post)
    this.loadRelatedPosts();
    
    // Scroll to top
    window.scrollTo(0, 0);
  }

  loadRelatedPosts(): void {
    if (!this.post) return;

    this.relatedPosts = this.blogService.getPublishedPosts()
      .filter(p => 
        p.id !== this.post!.id && 
        p.categories.some(cat => this.post!.categories.includes(cat))
      )
      .slice(0, 3);
  }

  formatDate(date: Date | undefined): string {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/blog']);
  }
}
