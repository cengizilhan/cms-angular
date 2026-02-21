import { User } from './user.model';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: Omit<User, 'password'>;
  categories: string[];
  tags: string[];
  status: BlogStatus;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  viewCount?: number;
}

export type BlogStatus = 'draft' | 'published' | 'archived';

export interface CreateBlogPost {
  title: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  status: BlogStatus;
  publishedAt?: Date;
}

export interface UpdateBlogPost extends Partial<CreateBlogPost> {
  id: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  postCount: number;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogFilters {
  status?: BlogStatus;
  category?: string;
  tag?: string;
  author?: string;
  search?: string;
}
