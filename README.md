# ronydb

ronydb is a full-stack web application designed to manage, display, and interact with personal or professional data, such as CVs, files, and custom fields. The project leverages a modern React frontend, Node.js backend, and integrates with Supabase for storage and authentication.

## Features

- **User Authentication**: Secure login system (Supabase Auth)
- **Dashboard**: Centralized view for managing data
- **Custom Field Editor**: Add, edit, and render custom fields dynamically
- **File Upload**: Upload and manage files (images, PDFs, etc.)
- **Drag-and-Drop List**: Reorder items with intuitive drag-and-drop UI
- **Theme Toggle**: Switch between light and dark modes
- **Responsive Design**: Optimized for desktop and mobile

## Project Structure

```
ronydb/
├── backend/                # Node.js backend (API, business logic)
├── src/                    # Frontend source code (React + TypeScript)
│   ├── components/         # Reusable UI components
│   ├── files/              # Static files (images, PDFs)
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions (Supabase, data helpers)
│   └── App.tsx             # Main React app entry
├── public/                 # Static public assets (if any)
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

## Usage

- Access the app at `http://localhost:5173` (or the port specified by Vite)
- Log in or register using your Supabase credentials
- Use the dashboard to manage your data, upload files, and customize fields

## Scripts

- `npm run dev` – Start the frontend in development mode
- `npm run build` – Build the frontend for production
- `npm run preview` – Preview the production build
- `npm start` (in backend/) – Start the backend server

## Technologies Used

- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Backend:** Node.js (Express or similar)
- **Database & Auth:** Supabase
- **Other:** Drag-and-drop, file upload, custom field management

## Contributing

Contributions are welcome! Please open issues or submit pull requests for improvements and bug fixes.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

## Acknowledgements

- [Supabase](https://supabase.com/)
- [React](https://react.dev/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)

