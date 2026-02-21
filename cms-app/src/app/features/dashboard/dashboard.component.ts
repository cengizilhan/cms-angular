import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../core/services/auth.service';
import { BlogService } from '../../core/services/blog.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  currentUser = this.authService.currentUser;
  totalPosts = 0;
  publishedPosts = 0;
  draftPosts = 0;

  constructor(
    private authService: AuthService,
    private blogService: BlogService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    const posts = this.blogService.getAllPosts();
    this.totalPosts = posts.length;
    this.publishedPosts = posts.filter(p => p.status === 'published').length;
    this.draftPosts = posts.filter(p => p.status === 'draft').length;
  }



  navigateToBlogList(): void {
    this.router.navigate(['/dashboard/blogs']);
  }

  navigateToCreatePost(): void {
    this.router.navigate(['/dashboard/blogs/new']);
  }
}

