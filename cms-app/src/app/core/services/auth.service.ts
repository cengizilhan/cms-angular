import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { User, LoginCredentials, RegisterData, AuthResponse } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly STORAGE_KEY = 'cms_auth_token';
  private readonly USERS_KEY = 'cms_users';
  
  currentUser = signal<Omit<User, 'password'> | null>(null);
  isAuthenticated = signal<boolean>(false);

  constructor(private router: Router) {
    this.initializeDefaultAdmin();
    this.loadUserFromStorage();
  }

  /**
   * Initialize default admin user if no users exist
   */
  private initializeDefaultAdmin(): void {
    const users = this.getUsers();
    
    // Only create default admin if no users exist
    if (users.length === 0) {
      const defaultAdmin: User = {
        id: this.generateId(),
        email: 'admin@cms.com',
        username: 'admin',
        password: 'admin123',
        firstName: 'Admin',
        lastName: 'User',
        role: 'admin',
        createdAt: new Date(),
        lastLogin: new Date()
      };
      
      this.saveUsers([defaultAdmin]);
      console.log('✅ Default admin user created: admin@cms.com / admin123');
    }
  }

  /**
   * Login user with email and password
   */
  login(credentials: LoginCredentials): { success: boolean; message: string } {
    const users = this.getUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return { success: false, message: 'User not found' };
    }

    if (user.password !== credentials.password) {
      return { success: false, message: 'Invalid password' };
    }

    // Update last login
    user.lastLogin = new Date();
    this.updateUser(user);

    // Create auth response
    const { password, ...userWithoutPassword } = user;
    const token = this.generateToken(user);

    // Save to storage
    this.saveToStorage(token, userWithoutPassword);

    // Update signals
    this.currentUser.set(userWithoutPassword);
    this.isAuthenticated.set(true);

    return { success: true, message: 'Login successful' };
  }

  /**
   * Register new user
   */
  register(data: RegisterData): { success: boolean; message: string } {
    const users = this.getUsers();

    // Check if email already exists
    if (users.some(u => u.email === data.email)) {
      return { success: false, message: 'Email already exists' };
    }

    // Check if username already exists
    if (users.some(u => u.username === data.username)) {
      return { success: false, message: 'Username already exists' };
    }

    // Create new user
    const newUser: User = {
      id: this.generateId(),
      email: data.email,
      username: data.username,
      password: data.password,
      firstName: data.firstName,
      lastName: data.lastName,
      role: users.length === 0 ? 'admin' : 'editor', // First user is admin
      createdAt: new Date(),
      lastLogin: new Date()
    };

    // Save user
    users.push(newUser);
    this.saveUsers(users);

    // Auto login after registration
    const { password, ...userWithoutPassword } = newUser;
    const token = this.generateToken(newUser);
    this.saveToStorage(token, userWithoutPassword);

    this.currentUser.set(userWithoutPassword);
    this.isAuthenticated.set(true);

    return { success: true, message: 'Registration successful' };
  }

  /**
   * Logout current user
   */
  logout(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    this.router.navigate(['/login']);
  }

  /**
   * Get all users (public method for User Management)
   */
  getAllUsers(): Omit<User, 'password'>[] {
    const users = this.getUsers();
    return users.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  }

  /**
   * Delete a user (public method for User Management)
   */
  deleteUser(userId: string): { success: boolean; message: string } {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      return { success: false, message: 'User not found' };
    }

    const userToDelete = users[index];
    
    // Check if trying to delete current user
    if (this.currentUser()?.id === userId) {
      return { success: false, message: 'You cannot delete your own account' };
    }

    // Check if trying to delete the last admin
    if (userToDelete.role === 'admin') {
      const admins = users.filter(u => u.role === 'admin');
      if (admins.length <= 1) {
        return { success: false, message: 'You cannot delete the only remaining administrator' };
      }
    }

    users.splice(index, 1);
    this.saveUsers(users);
    
    return { success: true, message: `User ${userToDelete.username} deleted successfully` };
  }

  /**
   * Load user from localStorage on app init
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem(this.STORAGE_KEY);
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const users = this.getUsers();
        const user = users.find(u => u.id === payload.userId);
        
        if (user) {
          const { password, ...userWithoutPassword } = user;
          this.currentUser.set(userWithoutPassword);
          this.isAuthenticated.set(true);
        }
      } catch (error) {
        console.error('Failed to load user from storage', error);
        localStorage.removeItem(this.STORAGE_KEY);
      }
    }
  }

  /**
   * Get all users from localStorage
   */
  private getUsers(): User[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    if (!usersJson) {
      return [];
    }
    return JSON.parse(usersJson);
  }

  /**
   * Save all users to localStorage
   */
  private saveUsers(users: User[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Update a single user
   */
  private updateUser(user: User): void {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index !== -1) {
      users[index] = user;
      this.saveUsers(users);
    }
  }

  /**
   * Save auth data to localStorage
   */
  private saveToStorage(token: string, user: Omit<User, 'password'>): void {
    localStorage.setItem(this.STORAGE_KEY, token);
  }

  /**
   * Generate a simple JWT-like token
   */
  private generateToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({ 
      userId: user.id, 
      email: user.email,
      role: user.role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    return `${header}.${payload}.signature`;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
