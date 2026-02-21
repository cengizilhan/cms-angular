import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ButtonModule],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.scss'
})
export class DashboardLayoutComponent {
  currentUser = this.authService.currentUser;
  isSidebarCollapsed = false;

  menuItems = [
    { label: 'Dashboard', icon: 'pi pi-home', route: '/dashboard', exact: true },
    { 
      label: 'Posts', 
      icon: 'pi pi-file', 
      children: [
        { label: 'All Posts', route: '/dashboard/blogs' },
        { label: 'Add New', route: '/dashboard/blogs/new' }
      ]
    },
    { label: 'Categories', icon: 'pi pi-tags', route: '/dashboard/categories' },
    { label: 'Users', icon: 'pi pi-users', route: '/dashboard/users' },
  ];

  constructor(private authService: AuthService, private router: Router) {}

  toggleSidebar(): void {
    this.isSidebarCollapsed = !this.isSidebarCollapsed;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
