import { Injectable, signal } from '@angular/core';
import { BlogCategory } from '../models/blog.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly STORAGE_KEY = 'cms_categories';
  categories = signal<BlogCategory[]>([]);

  constructor() {
    this.loadCategories();
    if (this.categories().length === 0) {
      this.initializeDefaultCategories();
    }
  }

  private loadCategories(): void {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (stored) {
      this.categories.set(JSON.parse(stored));
    }
  }

  private saveCategories(categories: BlogCategory[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(categories));
    this.categories.set(categories);
  }

  private initializeDefaultCategories(): void {
    const defaults: BlogCategory[] = [
      { id: '1', name: 'Technology', slug: 'technology', description: 'Tech news and reviews', postCount: 0 },
      { id: '2', name: 'Tutorials', slug: 'tutorials', description: 'Step-by-step guides', postCount: 0 },
      { id: '3', name: 'General', slug: 'general', description: 'Miscellaneous posts', postCount: 0 }
    ];
    this.saveCategories(defaults);
  }

  getAllCategories(): BlogCategory[] {
    return this.categories();
  }

  getCategoryById(id: string): BlogCategory | undefined {
    return this.categories().find(c => c.id === id);
  }

  addCategory(data: Omit<BlogCategory, 'id' | 'postCount'>): { success: boolean; message: string } {
    const categories = this.categories();
    const slug = data.slug || this.generateSlug(data.name);
    
    if (categories.find(c => c.slug === slug)) {
      return { success: false, message: 'Category with this slug already exists' };
    }

    const newCategory: BlogCategory = {
      id: this.generateId(),
      name: data.name,
      slug: slug,
      description: data.description,
      postCount: 0
    };

    this.saveCategories([...categories, newCategory]);
    return { success: true, message: 'Category added successfully' };
  }

  updateCategory(id: string, data: Partial<BlogCategory>): { success: boolean; message: string } {
    let categories = this.categories();
    const index = categories.findIndex(c => c.id === id);
    
    if (index === -1) return { success: false, message: 'Category not found' };

    categories[index] = { ...categories[index], ...data };
    this.saveCategories([...categories]);
    return { success: true, message: 'Category updated successfully' };
  }

  deleteCategory(id: string): { success: boolean; message: string } {
    const categories = this.categories();
    const filtered = categories.filter(c => c.id !== id);
    
    if (filtered.length === categories.length) {
      return { success: false, message: 'Category not found' };
    }

    this.saveCategories(filtered);
    return { success: true, message: 'Category deleted successfully' };
  }

  private generateSlug(text: string): string {
    return text.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
  }

  private generateId(): string {
    return Math.random().toString(36).substring(2, 11);
  }
}
