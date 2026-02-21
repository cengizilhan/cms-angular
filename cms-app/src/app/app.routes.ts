import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/layout/dashboard-layout.component').then(m => m.DashboardLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'blogs',
        loadComponent: () => import('./features/blog/blog-list.component').then(m => m.BlogListComponent)
      },
      {
        path: 'blogs/new',
        loadComponent: () => import('./features/blog/blog-form.component').then(m => m.BlogFormComponent)
      },
      {
        path: 'blogs/:id/edit',
        loadComponent: () => import('./features/blog/blog-form.component').then(m => m.BlogFormComponent)
      },
      {
        path: 'categories',
        loadComponent: () => import('./features/category/category-list.component').then(m => m.CategoryListComponent)
      },
      {
        path: 'users',
        loadComponent: () => import('./features/users/user-list.component').then(m => m.UserListComponent)
      }
    ]
  },
  {
    path: 'blog',
    loadComponent: () => import('./features/public/blog-list.component').then(m => m.PublicBlogListComponent)
  },
  {
    path: 'blog/:slug',
    loadComponent: () => import('./features/public/blog-detail.component').then(m => m.PublicBlogDetailComponent)
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];
