import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ConfirmDialogModule,
    ToastModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  users: Omit<User, 'password'>[] = [];
  filteredUsers: Omit<User, 'password'>[] = [];
  searchTerm = '';

  constructor(
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.users = this.authService.getAllUsers();
    this.applyFilters();
  }

  applyFilters(): void {
    if (!this.searchTerm) {
      this.filteredUsers = [...this.users];
      return;
    }

    const lowerTerm = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.username.toLowerCase().includes(lowerTerm) ||
      user.email.toLowerCase().includes(lowerTerm) ||
      user.firstName.toLowerCase().includes(lowerTerm) ||
      user.lastName.toLowerCase().includes(lowerTerm)
    );
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  deleteUser(user: Omit<User, 'password'>): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete user "${user.username}"?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const result = this.authService.deleteUser(user.id);
        if (result.success) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: result.message
          });
          this.loadUsers();
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

  getRoleSeverity(role: string): 'success' | 'info' | 'secondary' | 'warn' | 'danger' {
    switch (role) {
      case 'admin':
        return 'danger';
      case 'editor':
        return 'info';
      case 'viewer':
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
