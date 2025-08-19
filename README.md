# Rony.DB - Personal CV & Portfolio Management System

**Version 3.0.0**

A sophisticated, secure web application for managing and showcasing professional CV and portfolio data. Built with modern React, TypeScript, and Supabase, featuring advanced security, real-time data sync, and comprehensive content management capabilities.

## ✨ Key Features

### 🔐 **Security & Authentication**
- **Restricted Access:** Google OAuth with allowlist-based authorization
- **Data Encryption:** AES encryption for sensitive information
- **Row Level Security:** Database-level access controls
- **Hidden Admin Panel:** Secure dashboard accessible only via direct URL (`/alutila999`)

### 📊 **Data Management**
- **Comprehensive CV Builder:** Manage basics, work experience, education, skills, projects, certificates, languages
- **Academic Records:** Detailed academic entry management with file uploads
- **Custom Fields:** Unlimited dynamic fields for any section with multiple data types (text, link, image, date, number, file)
- **Custom Tabs:** Create entirely new sections with custom fields
- **Password Bank:** Secure password management with vendor accounts
- **Tools Management:** Track and organize professional tools and platforms
- **Cover Letters:** Multiple cover letter templates and management
- **File Management:** Upload and organize documents, images, certificates with Supabase Storage
- **Drag & Drop:** Intuitive reordering of sections, items, and tabs
- **Real-time Sync:** Instant updates across all sessions via Supabase

### 🎨 **User Experience**
- **Dual Interface:** Public homepage for CV display + hidden admin dashboard
- **Modern UI:** Clean, responsive design with custom CSS variables and Tailwind
- **Theme System:** Dynamic light/dark mode with smooth transitions
- **Progressive Web App:** Installable with offline capabilities and service worker
- **Tab Visibility Control:** Show/hide any section on the public homepage
- **Custom Field Visibility:** Control which custom fields appear publicly
- **Export Options:** Download data as encrypted JSON, PDF generation, backup/restore
- **Copy-to-Clipboard:** One-click copying of any field value
- **Social Media Integration:** Support for 15+ social platforms with icons

### 🛠 **Developer & Security Features**
- **TypeScript:** Full type safety with comprehensive interfaces
- **Component Architecture:** 14 modular, reusable React components
- **DevTools Protection:** Advanced security measures against inspection and debugging
- **Environment Flexibility:** Works in both Vite and Node.js environments
- **Comprehensive Testing:** 16 E2E test files covering all major features
- **Email Management:** Admin email management system
- **Backup System:** Automated and manual backup/restore functionality

## 📁 Project Architecture

```
ronydb/
├── 📂 src/                    # Frontend source code (React + TypeScript)
│   ├── 📂 components/         # 14 React components
│   │   ├── Alutila999.tsx     # Hidden admin dashboard (3,715 lines)
│   │   ├── HomePage.tsx       # Public CV display (2,620 lines)
│   │   ├── LoginPage.tsx      # Google OAuth authentication
│   │   ├── BackupRestore.tsx  # Data backup/restore system
│   │   ├── CustomFieldEditor.tsx # Dynamic field management
│   │   ├── CustomFieldRenderer.tsx # Field display logic
│   │   ├── CustomFieldRow.tsx # Individual field components
│   │   ├── EmailManager.tsx   # Admin email management
│   │   ├── FileUpload.tsx     # Supabase Storage integration
│   │   ├── DragDropList.tsx   # Reorderable lists
│   │   ├── ThemeToggle.tsx    # Light/dark mode switcher
│   │   ├── CopyButton.tsx     # Clipboard functionality
│   │   ├── Toast.tsx          # Notification system
│   │   └── NotFoundPage.tsx   # 404 error page
│   ├── 📂 utils/              # Core utilities
│   │   ├── supabaseClient.ts  # Database connection & auth
│   │   ├── encryption.ts      # AES encryption (CryptoJS)
│   │   ├── cvData.ts          # Data management & defaults
│   │   └── devToolsProtection.ts # Security & anti-debugging
│   ├── 📂 types/              # TypeScript definitions
│   │   └── cv.ts             # Complete data interfaces (174 lines)
│   └── 📂 styles/            # CSS styling
│       ├── index.css         # Global styles & animations
│       └── homepage.css      # Homepage-specific styles
├── 📂 e2e/                   # Playwright E2E tests (16 test files)
│   ├── homepage.spec.ts      # Public homepage tests
│   ├── dashboard.spec.ts     # Admin dashboard tests
│   ├── auth-edge.spec.ts     # Authentication edge cases
│   ├── customfield-edge.spec.ts # Custom field testing
│   └── ...                   # Additional test coverage
├── 📂 keepalive/             # Uptime monitoring system
│   ├── cron-scheduler.js     # Automated keep-alive pings
│   ├── encryptionUtils.js    # Server-side encryption
│   └── package.json          # Separate Node.js dependencies
├── 📂 public/                # Static assets
│   ├── icon-192x192.png      # PWA icons
│   ├── icon-512x512.png      # PWA icons
│   └── manifest.webmanifest  # PWA configuration
├── 📂 test/                  # Testing utilities
│   └── simple-encryption-test.cjs # Encryption validation
├── 📄 package.json           # Dependencies & npm scripts
├── 📄 vite.config.ts         # Vite + PWA configuration
├── 📄 playwright.config.ts   # E2E testing configuration
├── 📄 tailwind.config.js     # CSS utility configuration
└── 📄 .env.example           # Environment variables template
```

## 🔒 Advanced Security Architecture

### Multi-Layer Authentication
1. **Google OAuth Integration:** Secure authentication via Supabase Auth
2. **Allowlist Verification:** Email validation against `allowed_users` table with RLS
3. **Session Management:** JWT tokens with automatic refresh
4. **Route Protection:** Hidden admin routes (`/alutila999`) with authentication guards

### Data Encryption & Protection
- **AES-256 Encryption:** CryptoJS implementation for sensitive data
- **Environment-Based Keys:** Secure key management via `VITE_ENCRYPTION_KEY`
- **Dual Environment Support:** Works in both Vite and Node.js contexts
- **Encrypted Storage:** Password bank and sensitive fields encrypted before database storage

### Client-Side Security
- **DevTools Protection:** Advanced anti-debugging and inspection prevention
- **Console Warnings:** Security alerts for unauthorized access attempts
- **Source Code Obfuscation:** Production build optimizations
- **HTTPS Enforcement:** Secure communication channels

### Database Security
- **Row Level Security (RLS):** Supabase policies for data access control
- **Anonymous Access Control:** Separate policies for authenticated vs anonymous users
- **Encrypted User Data:** Email, passwords, and sensitive fields encrypted at rest

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v18+ recommended)
- **npm** or **yarn**
- **Supabase** account with project setup

### Installation

1. **Clone & Install**
   ```bash
   git clone https://github.com/khalakuzamanrony/ronydb.git
   cd ronydb
   npm install
   ```

2. **Environment Setup**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

3. **Database Setup**
   - Create new Supabase project at [supabase.com](https://supabase.com)
   - Enable Google OAuth in Authentication > Providers
   - Create `allowed_users` table with RLS policies
   - Add authorized emails to the allowlist
   - Configure Supabase Storage bucket for file uploads

4. **Development Server**
   ```bash
   npm run dev
   # App available at http://localhost:5173
   ```

### Environment Variables
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ENCRYPTION_KEY=your-32-character-encryption-key
```

## 📖 Usage Guide

### Public Access
- **Homepage (`/`):** View CV and portfolio (no authentication required)
- **Responsive Design:** Optimized for all devices
- **Theme Toggle:** Switch between light/dark modes

### Admin Access
- **Login (`/login`):** Google OAuth authentication
- **Dashboard (`/alutila999`):** Hidden admin panel for data management
- **Restricted Access:** Only authorized emails can access admin features

### Core Workflows

#### 📝 **Content Management**
1. **Access Admin Panel:** Navigate to `/alutila999` (hidden URL)
2. **Manage Sections:** Edit basics, work experience, education, skills, projects, certificates, languages
3. **Academic Records:** Add detailed academic entries with file attachments
4. **Custom Fields:** Create unlimited custom fields with 6 data types (text, link, image, date, number, file)
5. **Custom Tabs:** Build entirely new sections with custom fields
6. **Password Management:** Securely store and manage vendor passwords
7. **Tools Tracking:** Organize professional tools and platforms
8. **Cover Letters:** Create and manage multiple cover letter templates
9. **Drag & Drop:** Reorder sections, items, and tabs intuitively
10. **Visibility Control:** Toggle section and field visibility on public homepage

#### 📁 **Advanced File Management**
1. **Multi-Format Support:** Upload images, PDFs, documents, certificates
2. **Supabase Storage:** Secure cloud storage with direct links
3. **File Organization:** Categorize by section and purpose
4. **Academic Files:** Attach transcripts, certificates to academic entries
5. **Resume Management:** Upload and manage multiple resume versions
6. **Backup Files:** Include files in backup/restore operations

#### 🔄 **Data Operations & Security**
- **Encrypted Backups:** Export all data as AES-encrypted JSON
- **Selective Restore:** Import specific sections or complete backups
- **PDF Generation:** Professional CV export with jsPDF
- **Real-time Sync:** Instant updates via Supabase real-time subscriptions
- **Email Management:** Admin control over authorized user emails
- **Theme Persistence:** User preferences saved across sessions
- **Tab Ordering:** Custom section arrangement with drag-and-drop

## 🧪 Testing

### E2E Testing with Playwright
Comprehensive test suite covering all major features:

```bash
# Install browsers
npx playwright install

# Run all tests
npx playwright test

# Run specific test
npx playwright test e2e/homepage.spec.ts

# Run with UI
npx playwright test --ui
```

### Comprehensive Test Coverage (16 Test Files)
- **Authentication:** `auth-edge.spec.ts`, `google-auth.spec.ts`, `login.spec.ts`
- **Homepage:** `homepage.spec.ts` - Public CV display and navigation
- **Dashboard:** `dashboard.spec.ts` - Complete admin panel functionality
- **File Operations:** `file-edge.spec.ts`, `fileupload.spec.ts` - Document management
- **Custom Fields:** `customfield-edge.spec.ts` - Dynamic field operations and validation
- **UI/UX:** `theme.spec.ts`, `uiux-edge.spec.ts` - Theme switching and user experience
- **Content Management:** `tabs-edge.spec.ts`, `coverletter-edge.spec.ts` - Section and content management
- **Utilities:** `copybutton.spec.ts`, `clipboard-edge.spec.ts` - Copy functionality
- **Tools:** `profile-tool-edge.spec.ts` - Professional tools management
- **Error Handling:** `errors.spec.ts` - Comprehensive error scenarios
- **Multi-browser:** Chromium, Firefox, WebKit compatibility

### Test Configuration
- **Multi-browser:** Chromium, Firefox, WebKit
- **Screenshots:** Captured on failure
- **Videos:** Recorded for debugging
- **Base URL:** Configurable for different environments

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm run decrypt` | Test encryption utilities |
| `npx playwright test` | Run E2E tests |

## 🛠 Technology Stack

### Frontend Stack
- **React 18.3.1** - Modern UI framework with hooks and concurrent features
- **TypeScript 5.5.3** - Full type safety with comprehensive interfaces
- **Vite 5.4.2** - Lightning-fast build tool and dev server
- **Tailwind CSS 3.4.1** - Utility-first CSS with custom design system
- **Lucide React 0.344.0** - Beautiful, customizable icons (20+ icons used)
- **React Icons 5.5.0** - Social media and platform icons (15+ platforms)

### Backend & Database
- **Supabase 2.51.0** - Complete Backend-as-a-Service
- **PostgreSQL** - Robust relational database with JSON support
- **Supabase Auth** - Google OAuth integration with JWT
- **Row Level Security** - Database-level access control policies
- **Supabase Storage** - Secure file storage with CDN
- **Real-time Subscriptions** - Live data synchronization

### Security & Utilities
- **CryptoJS 4.2.0** - AES-256 encryption for sensitive data
- **Google OAuth 2.0** - Secure authentication flow
- **jsPDF 3.0.1** - Client-side PDF generation
- **React Select 5.10.2** - Enhanced dropdown components
- **js-file-download 0.4.12** - File download utilities
- **Custom DevTools Protection** - Anti-debugging and inspection prevention

### Development & Testing
- **Playwright 1.54.1** - Cross-browser E2E testing (16 test files)
- **ESLint 9.9.1** - Code quality and consistency
- **TypeScript ESLint 8.3.0** - TypeScript-specific linting rules
- **PostCSS 8.4.35** - CSS processing and optimization
- **Autoprefixer 10.4.18** - Automatic vendor prefixes

### Deployment & PWA
- **Vite PWA Plugin 1.0.1** - Progressive Web App capabilities
- **Service Worker** - Offline functionality and caching
- **Web App Manifest** - Native app-like installation
- **Netlify** - Production deployment platform
- **Environment Variables** - Secure configuration management

## 🔧 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **App won't start** | Check `.env` file exists, verify Supabase credentials, run `npm install` |
| **Login fails** | Verify email exists in `allowed_users` table, check Google OAuth config |
| **File upload errors** | Verify Supabase Storage bucket exists, check RLS policies, ensure public access |
| **Tests failing** | Run `npx playwright install`, check base URL in `playwright.config.ts` |
| **Build errors** | Clear `node_modules`, delete `package-lock.json`, run `npm install` |
| **Encryption errors** | Verify `VITE_ENCRYPTION_KEY` is 32+ characters, test with `npm run decrypt` |
| **DevTools blocked** | Normal security feature, disable in development if needed |
| **Theme not persisting** | Check localStorage permissions, verify CSS variables loading |

### Debug Mode
```bash
# Enable detailed logging
VITE_DEBUG=true npm run dev

# Test encryption
npm run decrypt
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Add tests for new features
- Update documentation
- Maintain consistent code style

## 📄 License

MIT License - see [LICENSE](LICENSE) for details.

## 🙏 Acknowledgements

- **[Supabase](https://supabase.com/)** - Backend infrastructure
- **[React](https://react.dev/)** - UI framework
- **[Vite](https://vitejs.dev/)** - Build tool
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling
- **[Playwright](https://playwright.dev/)** - Testing framework

---
 
**Built with ❤️ by [Khalekuzzaman Rony](https://github.com/khalakuzamanrony)**
