import { Injectable, signal } from '@angular/core';
import { BlogPost, CreateBlogPost, UpdateBlogPost, BlogStatus, BlogFilters } from '../models/blog.model';
import { AuthService } from './auth.service';
import { CategoryService } from './category.service';

@Injectable({
  providedIn: 'root'
})
export class BlogService {
  private readonly STORAGE_KEY = 'cms_blog_posts';
  
  posts = signal<BlogPost[]>([]);
  
  constructor(
    private authService: AuthService,
    private categoryService: CategoryService
  ) {
    this.initializeSamplePosts();
    this.loadPosts();
  }

  /**
   * Get all blog posts
   */
  getAllPosts(): BlogPost[] {
    return this.posts();
  }

  /**
   * Get published posts only (for public view)
   */
  getPublishedPosts(): BlogPost[] {
    return this.posts().filter(post => post.status === 'published');
  }

  /**
   * Get post by ID
   */
  getPostById(id: string): BlogPost | undefined {
    return this.posts().find(post => post.id === id);
  }

  /**
   * Get post by slug
   */
  getPostBySlug(slug: string): BlogPost | undefined {
    return this.posts().find(post => post.slug === slug);
  }

  /**
   * Get posts with filters
   */
  getFilteredPosts(filters: BlogFilters): BlogPost[] {
    let filtered = this.posts();

    if (filters.status) {
      filtered = filtered.filter(post => post.status === filters.status);
    }

    if (filters.category) {
      filtered = filtered.filter(post => 
        post.categories.includes(filters.category!)
      );
    }

    if (filters.tag) {
      filtered = filtered.filter(post => 
        post.tags.includes(filters.tag!)
      );
    }

    if (filters.author) {
      filtered = filtered.filter(post => 
        post.author.id === filters.author
      );
    }

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchLower) ||
        post.excerpt.toLowerCase().includes(searchLower) ||
        post.content.toLowerCase().includes(searchLower)
      );
    }

    return filtered;
  }

  /**
   * Create new blog post
   */
  createPost(data: CreateBlogPost): { success: boolean; message: string; post?: BlogPost } {
    const currentUser = this.authService.currentUser();
    
    if (!currentUser) {
      return { success: false, message: 'User not authenticated' };
    }

    const slug = this.generateSlug(data.title);
    
    // Check if slug already exists
    if (this.getPostBySlug(slug)) {
      return { success: false, message: 'A post with this title already exists' };
    }

    const newPost: BlogPost = {
      id: this.generateId(),
      title: data.title,
      slug,
      content: data.content,
      excerpt: data.excerpt,
      featuredImage: data.featuredImage,
      author: currentUser,
      categories: data.categories,
      tags: data.tags,
      status: data.status,
      publishedAt: data.status === 'published' ? (data.publishedAt || new Date()) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      viewCount: 0
    };

    const posts = [...this.posts(), newPost];
    this.savePosts(posts);
    this.posts.set(posts);

    return { success: true, message: 'Post created successfully', post: newPost };
  }

  /**
   * Update existing blog post
   */
  updatePost(data: UpdateBlogPost): { success: boolean; message: string; post?: BlogPost } {
    const posts = this.posts();
    const index = posts.findIndex(post => post.id === data.id);

    if (index === -1) {
      return { success: false, message: 'Post not found' };
    }

    const existingPost = posts[index];
    
    // Generate new slug if title changed
    let slug = existingPost.slug;
    if (data.title && data.title !== existingPost.title) {
      slug = this.generateSlug(data.title);
      
      // Check if new slug already exists
      const slugExists = posts.some(post => post.slug === slug && post.id !== data.id);
      if (slugExists) {
        return { success: false, message: 'A post with this title already exists' };
      }
    }

    const updatedPost: BlogPost = {
      ...existingPost,
      ...data,
      slug,
      updatedAt: new Date(),
      publishedAt: data.status === 'published' && !existingPost.publishedAt 
        ? new Date() 
        : existingPost.publishedAt
    };

    const updatedPosts = [...posts];
    updatedPosts[index] = updatedPost;
    
    this.savePosts(updatedPosts);
    this.posts.set(updatedPosts);

    return { success: true, message: 'Post updated successfully', post: updatedPost };
  }

  /**
   * Delete blog post
   */
  deletePost(id: string): { success: boolean; message: string } {
    const posts = this.posts();
    const filtered = posts.filter(post => post.id !== id);

    if (filtered.length === posts.length) {
      return { success: false, message: 'Post not found' };
    }

    this.savePosts(filtered);
    this.posts.set(filtered);

    return { success: true, message: 'Post deleted successfully' };
  }

  /**
   * Increment view count
   */
  incrementViewCount(id: string): void {
    const posts = this.posts();
    const index = posts.findIndex(post => post.id === id);

    if (index !== -1) {
      const updatedPosts = [...posts];
      updatedPosts[index] = {
        ...updatedPosts[index],
        viewCount: (updatedPosts[index].viewCount || 0) + 1
      };
      
      this.savePosts(updatedPosts);
      this.posts.set(updatedPosts);
    }
  }

  /**
   * Get all unique categories (from CategoryService)
   */
  getAllCategories(): string[] {
    return this.categoryService.getAllCategories().map((c: any) => c.name);
  }

  /**
   * Get all unique tags
   */
  getAllTags(): string[] {
    const tags = new Set<string>();
    this.posts().forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }

  /**
   * Load posts from localStorage
   */
  private loadPosts(): void {
    const postsJson = localStorage.getItem(this.STORAGE_KEY);
    if (postsJson) {
      try {
        const posts = JSON.parse(postsJson);
        this.posts.set(posts);
      } catch (error) {
        console.error('Failed to load posts from storage', error);
      }
    }
  }

  /**
   * Save posts to localStorage
   */
  private savePosts(posts: BlogPost[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(posts));
  }

  /**
   * Initialize sample blog posts
   */
  private initializeSamplePosts(): void {
    const existingPosts = localStorage.getItem(this.STORAGE_KEY);
    
    if (!existingPosts) {
      const samplePosts: BlogPost[] = [
        {
          id: this.generateId(),
          title: 'Getting Started with Angular CMS',
          slug: 'getting-started-with-angular-cms',
          content: '<h2>Welcome to our CMS!</h2><p>This is a sample blog post to demonstrate the capabilities of our content management system. Angular provides a powerful framework for building dynamic web applications.</p><p>In this post, we\'ll explore the key features of our CMS and how you can leverage them to create amazing content.</p>',
          excerpt: 'Learn how to get started with our Angular-based content management system.',
          featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
          author: {
            id: 'admin',
            email: 'admin@cms.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date(),
            lastLogin: new Date()
          },
          categories: ['Technology', 'Tutorial'],
          tags: ['angular', 'cms', 'getting-started'],
          status: 'published',
          publishedAt: new Date('2024-01-15'),
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-15'),
          viewCount: 42
        },
        {
          id: this.generateId(),
          title: 'Best Practices for Content Management',
          slug: 'best-practices-for-content-management',
          content: '<h2>Content Management Best Practices</h2><p>Managing content effectively requires following industry best practices. Here are some key principles to keep in mind:</p><ul><li>Keep your content organized with categories and tags</li><li>Use descriptive titles and excerpts</li><li>Optimize images for web performance</li><li>Schedule posts for optimal engagement</li></ul>',
          excerpt: 'Discover the best practices for managing your content effectively.',
          featuredImage: 'https://images.unsplash.com/photo-1432821596592-e2c18b78144f?w=800',
          author: {
            id: 'admin',
            email: 'admin@cms.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date(),
            lastLogin: new Date()
          },
          categories: ['Best Practices', 'Content Strategy'],
          tags: ['content', 'management', 'tips'],
          status: 'published',
          publishedAt: new Date('2024-02-01'),
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
          viewCount: 28
        },
        {
          id: this.generateId(),
          title: 'Draft: Upcoming Features',
          slug: 'draft-upcoming-features',
          content: '<h2>Exciting New Features Coming Soon</h2><p>We\'re working on some amazing new features for our CMS platform. Stay tuned for updates!</p>',
          excerpt: 'A sneak peek at the upcoming features we\'re developing.',
          author: {
            id: 'admin',
            email: 'admin@cms.com',
            username: 'admin',
            firstName: 'Admin',
            lastName: 'User',
            role: 'admin',
            createdAt: new Date(),
            lastLogin: new Date()
          },
          categories: ['News'],
          tags: ['updates', 'features'],
          status: 'draft',
          createdAt: new Date(),
          updatedAt: new Date(),
          viewCount: 0
        }
      ];

      this.savePosts(samplePosts);
      console.log('✅ Sample blog posts created');
    }
  }

  /**
   * Generate URL-friendly slug from title
   */
  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  }
}
