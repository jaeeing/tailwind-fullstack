# 👥 User Management System

A modern full-stack user management application with dark mode, built with React, Tailwind CSS, Express, and Prisma.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-18.3-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-blue)

## ✨ Features

### 🎨 UI/UX
- 🌙 **Dark Mode** - Toggle with localStorage persistence
- 📱 **Responsive Design** - Mobile, tablet, and desktop optimized
- 📊 **Statistics Dashboard** - Real-time user analytics
- 🎭 **Grid/List View** - Switch between card and list layouts
- 🔔 **Toast Notifications** - Success, error, and info alerts
- 🎨 **Gradient Cards** - Beautiful color schemes

### 🔧 Functionality
- ✅ **CRUD Operations** - Create, Read, Update, Delete users
- 🔍 **Search** - Real-time search by name or email
- 📊 **Sort** - Sort by name, email, or date (ascending/descending)
- ✉️ **Email Validation** - Regex-based validation
- 🎯 **Duplicate Check** - Prevent duplicate emails

## 🛠️ Tech Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS 3.4** - Utility-first CSS
- **Vite** - Build tool

### Backend
- **Express.js** - Web framework
- **Prisma 7** - ORM with LibSQL adapter
- **SQLite** - Database

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/jaeeing/tailwind-fullstack.git
cd tailwind-fullstack
```

2. **Install dependencies**
```bash
npm install
```

3. **Generate Prisma Client**
```bash
npx prisma generate
```

4. **Create database (if not exists)**
```bash
npx prisma migrate dev --name init
```

## 🚀 Usage

### Development Mode

Run both frontend and backend simultaneously:

```bash
npm run dev:all
```

Or run separately:

**Backend** (Terminal 1):
```bash
npm run dev:backend
```

**Frontend** (Terminal 2):
```bash
npm run dev:frontend
```

### Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/users

## 📝 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| DELETE | `/api/users/:id` | Delete user |

### Example Request

**Create User:**
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","name":"John Doe"}'
```

## 🎨 Tailwind Features Showcased

This project demonstrates various Tailwind CSS capabilities:

- **Dark Mode** - `dark:` prefix for dark mode styles
- **Gradients** - `bg-gradient-to-r from-blue-500 to-blue-600`
- **Hover Effects** - `hover:scale-105`, `hover:bg-gray-50`
- **Transitions** - `transition-colors duration-300`
- **Responsive Grid** - `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Shadows** - `shadow-lg shadow-yellow-500/50`
- **Animations** - Custom slide-in animations

## 📸 Screenshots

### Light Mode
![Light Mode](https://via.placeholder.com/800x400?text=Light+Mode+Screenshot)

### Dark Mode
![Dark Mode](https://via.placeholder.com/800x400?text=Dark+Mode+Screenshot)

### Grid View
![Grid View](https://via.placeholder.com/800x400?text=Grid+View+Screenshot)

## 🗂️ Project Structure

```
tailwind-fullstack/
├── api/
│   └── server.ts           # Express backend server
├── prisma/
│   └── schema.prisma       # Database schema
├── src/
│   ├── App.tsx            # Main React component
│   ├── main.tsx           # React entry point
│   └── index.css          # Tailwind directives
├── prisma.config.ts       # Prisma configuration
├── tailwind.config.js     # Tailwind configuration
├── vite.config.ts         # Vite configuration
└── package.json           # Dependencies
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

### Tailwind Configuration

Customize colors, fonts, and more in `tailwind.config.js`:

```javascript
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Your custom theme
    },
  },
  plugins: [],
}
```

## 📚 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev:all` | Run both frontend and backend |
| `npm run dev:backend` | Run backend only |
| `npm run dev:frontend` | Run frontend only |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Change port in api/server.ts
const PORT = 3001; // Change from 3000
```

### Prisma Issues
```bash
# Reset Prisma
rm -rf node_modules/.prisma
npx prisma generate
```

### Tailwind Not Working
```bash
# Reinstall Tailwind
npm install -D tailwindcss@3 postcss autoprefixer
npx tailwindcss init -p
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👤 Author

**Jaeeing**
- GitHub: [@jaeeing](https://github.com/jaeeing)

## 🙏 Acknowledgments

- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Prisma](https://www.prisma.io/)
- [Vite](https://vitejs.dev/)

## 📝 Changelog

### v1.0.0 (2026-02-03)
- ✅ Initial release
- ✅ CRUD operations
- ✅ Dark mode
- ✅ Search and sort
- ✅ Toast notifications
- ✅ Grid/List view toggle
- ✅ Statistics dashboard
- ✅ Responsive design

---

Made with ❤️ by Jaeeing
