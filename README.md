@ -1,196 +0,0 @@
# ronydb

ronydb is a full-stack web application for managing, displaying, and interacting with personal or professional data—such as CVs, files, and custom fields. It features a modern React frontend, Node.js backend, and integrates with Supabase for storage and authentication.

## Features

- **User Authentication:** Secure login system (Supabase Auth)
- **Dashboard:** Centralized view for managing all your data
- **Custom Field Editor:** Add, edit, and render custom fields dynamically for maximum flexibility
- **File Upload & Management:** Upload and manage files (images, PDFs, etc.) with Supabase Storage
- **Drag-and-Drop List:** Reorder items with an intuitive drag-and-drop UI
- **Theme Toggle:** Switch between light and dark modes instantly
- **Responsive Design:** Optimized for desktop and mobile
- **Real-time Updates:** Changes sync live via Supabase
- **Download & Export:** Download your data as JSON or PDF
- **Copy-to-Clipboard:** One-click copy for any field or value
- **Data Encryption:** Sensitive data is encrypted before storage and decrypted for display

## Data Encryption

The application implements AES encryption for sensitive data stored in Supabase:

- **Encryption Process:** Data is encrypted using AES (Advanced Encryption Standard) before being saved to Supabase
- **Environment Variables:** Encryption key is stored in `.env` file as `VITE_ENCRYPTION_KEY`
- **Automatic Handling:** Encryption/decryption happens automatically when saving/retrieving data
- **Encryption Management:** Data is automatically encrypted and decrypted using the key in the environment variables

## Project Structure

```
ronydb/
├── backend/                # Node.js backend (API, business logic)
├── src/                    # Frontend source code (React + TypeScript)
│   ├── components/         # Reusable UI components
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions (Supabase, data helpers)
│   │   └── encryption.ts   # Encryption/decryption utilities
│   └── App.tsx             # Main React app entry
├── e2e/                    # End-to-end Playwright tests
├── public/                 # Static public assets
├── scripts/                # Utility scripts
│   └── loadEnv.ts          # Script to load environment variables
├── package.json            # Project metadata and scripts
├── tailwind.config.js      # Tailwind CSS configuration
├── vite.config.ts          # Vite build configuration
└── README.md               # Project documentation
```

## Getting Started

### Prerequisites
- Node.js (v16+ recommended)
- npm or yarn
- Supabase account (for backend services)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/ronydb.git
   cd ronydb
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Configure environment variables:**
   - Copy `.env.example` to `.env` and fill in your Supabase credentials and other required settings.

4. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **(Optional) Start the backend server:**
   ```bash
   cd backend
   npm install
   npm start
   ```

## Usage Guide

- Access the app at `http://localhost:5173` (or the port specified by Vite)
- **Demo Credentials:**
  - Username: ``
  - Password: `legacy`
- Log in or register using your Supabase credentials
- Use the dashboard to manage your data, upload files, and customize fields

### Feature Walkthrough

- **Dashboard:**
  - View and manage all your data in one place
  - Add, edit, or delete custom fields for any section (basics, work, education, etc.)
  - Drag and drop to reorder items or sections
- **File Upload:**
  - Upload images, PDFs, and other files to Supabase Storage
  - Download or preview files directly from the dashboard
- **Custom Fields:**
  - Add new fields to any section (e.g., add a LinkedIn link, portfolio, or custom note)
  - Fields are rendered dynamically and can be edited or removed at any time
- **Theme Toggle:**
  - Instantly switch between light and dark mode using the toggle in the dashboard or homepage
- **Download & Export:**
  - Download your entire CV/data as JSON or PDF with one click
- **Copy-to-Clipboard:**
  - Use the copy button next to any field to quickly copy its value

## Testing

This project uses **Playwright** for end-to-end (E2E) testing. Tests cover major user flows, UI features, and edge cases.

### Test Directory
- All E2E tests are located in the `e2e/` directory.
- Example test files:
  - `homepage.spec.ts` – Home page UI and navigation
  - `dashboard.spec.ts` – Dashboard features
  - `login.spec.ts` – Authentication flows
  - `fileupload.spec.ts` – File upload and management
  - `customfield-edge.spec.ts` – Custom field editor
  - ...and more for each major feature

### Running Tests

1. **Install Playwright (if not already):**
   ```bash
   npx playwright install
   ```
2. **Run all tests:**
   ```bash
   npx playwright test
   ```
3. **Run a specific test file:**
   ```bash
   npx playwright test e2e/homepage.spec.ts
   ```
4. **View test results and videos:**
   - Results and videos are saved in the `test-results/` directory by default.

### Playwright Configuration
- See `playwright.config.ts` for custom settings:
  - Tests run in Chromium, Firefox, and WebKit (Safari)
  - Base URL: `https://ronydb.netlify.app/` (update as needed for local testing)
  - Screenshots and videos are captured on failure

## Scripts

- `npm run dev` – Start the frontend in development mode
- `npm run build` – Build the frontend for production
- `npm run preview` – Preview the production build
- `npm run lint` – Run ESLint on the codebase
- `npm start` (in backend/) – Start the backend server

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js (Express or similar)
- **Database & Auth:** Supabase
- **Testing:** Playwright (E2E)
- **Other:** Drag-and-drop, file upload, custom field management

## Troubleshooting & FAQ

- **App won’t start?**
  - Check your `.env` file for correct Supabase credentials
  - Ensure all dependencies are installed
- **Tests not running?**
  - Make sure Playwright is installed (`npx playwright install`)
  - Check the base URL in `playwright.config.ts`
- **File upload issues?**
  - Ensure your Supabase Storage bucket is configured and public

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgements

- [Supabase](https://supabase.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Playwright](https://playwright.dev/)
