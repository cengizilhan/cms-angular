# CMS – Content Management System

A modern content management system built with Angular 18 and PrimeNG. It provides a clean admin dashboard where you can manage blog posts, categories, and users — along with a public-facing blog that visitors can browse.

## Features

### Authentication
- User registration and login with form validation
- Route protection using an auth guard — only logged-in users can access the dashboard
- Session persistence through localStorage

### Admin Dashboard
- A sidebar-based layout inspired by WordPress
- Overview panel showing post statistics (total, published, drafts)
- Collapsible sidebar for a more comfortable workspace

### Blog Management
- Full CRUD for blog posts (create, read, update, delete)
- Rich text editor powered by **Quill**
- Support for featured images, excerpts, categories, and tags
- Post status workflow: `draft`, `published`, `archived`
- SEO-friendly slug generation for each post

### Category Management
- Create and organise categories
- Each category tracks how many posts it contains

### User Management
- View and manage registered users from the dashboard

### Public Blog
- A separate public section where visitors can browse published posts
- Individual blog pages accessible via slug-based URLs (e.g. `/blog/my-first-post`)

## Tech Stack

| Layer        | Technology                          |
|--------------|-------------------------------------|
| Framework    | Angular 18 (standalone components)  |
| UI Library   | PrimeNG with Aura theme             |
| Rich Editor  | Quill                               |
| Styling      | SCSS                                |
| Language     | TypeScript 5.4                      |
| Persistence  | localStorage (no backend required)  |
| Icons        | PrimeIcons                          |

## Getting Started

### Prerequisites

- **Node.js** (v18 or higher recommended)
- **npm** (comes with Node.js)
- **Angular CLI** (v18)

### Installation

```bash
# Clone the repository
git clone https://github.com/cengizilhan/cms.git
cd cms/cms-app

# Install dependencies
npm install
```

### Running the App

```bash
npm run dev
```

The application will start on `http://localhost:4200` by default.

### Demo Account

A default admin account is created automatically on first launch. You can use it to log in right away:

| Field    | Value            |
|----------|------------------|
| Email    | `admin@cms.com`  |
| Password | `admin123`       |

You can also register a new account from the registration page. The first registered user always gets the **admin** role.

### Building for Production

```bash
npm run build
```

The compiled output will be placed in the `dist/` folder.

## Project Structure

```
cms-app/src/app/
├── core/
│   ├── guards/         # Auth guard for route protection
│   ├── models/         # TypeScript interfaces (BlogPost, User, etc.)
│   └── services/       # AuthService, BlogService, CategoryService
├── features/
│   ├── auth/           # Login & Register components
│   ├── blog/           # Blog list & form (admin side)
│   ├── category/       # Category management
│   ├── dashboard/      # Dashboard overview & sidebar layout
│   ├── public/         # Public blog list & detail pages
│   └── users/          # User management
└── shared/
    └── components/     # Reusable shared components
```

## Scripts

| Command         | Description                                  |
|-----------------|----------------------------------------------|
| `npm run dev`   | Start the development server                 |
| `npm run build` | Build the app for production                 |
| `npm run test`  | Run unit tests with Karma                    |
| `npm run watch` | Build in watch mode for development          |

## License

This project is open source and available under the [MIT License](LICENSE).
