# Toffan Glass Solutions Portal

A modern web application for Toffan Glass Solutions with user authentication, product management, and dashboard functionality.

## Features

- **User Authentication**: Secure login and registration system
- **Role-based Access**: Admin, Staff, and Customer roles
- **Product Management**: Browse and manage glass and hardware products
- **Responsive Design**: Mobile-friendly interface
- **Dashboard**: Role-specific dashboards for different user types

## Technology Stack

### Frontend
- React 19.2.4
- TypeScript
- Vite (Build tool)
- Tailwind CSS
- React Router DOM
- Lucide React (Icons)

### Backend
- Node.js
- Express.js
- SQLite (Development database)
- JWT Authentication
- Bcrypt (Password hashing)

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd toffan-glass
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ````

3. **Navigate to backend directory and install dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Initialize the database**
   ```bash
   npm run init-sqlite
   ```

### Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:5000`

2. **Start the frontend development server**
   ```bash
   cd ..  # Go back to root directory
   npm run dev
   ```
   The frontend will run on `http://localhost:3000`

### Default Credentials

**Admin User:**
- Email: `admin@toffanglass.com`
- Password: `admin123`
- Role: ADMIN

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile (authenticated)
- `PUT /api/auth/profile` - Update user profile (authenticated)

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search?q=query` - Search products
- `POST /api/products` - Create product (admin/staff only)
- `PUT /api/products/:id` - Update product (admin/staff only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Users (Admin/Staff only)
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID
- `PUT /api/users/:id` - Update user (admin only)
- `DELETE /api/users/:id` - Delete user (admin only)

## Project Structure

```
toffan-glass/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── sqliteDb.js          # SQLite database configuration
│   │   ├── controllers/
│   │   │   ├── authController.js     # Authentication logic
│   │   │   └── productController.js  # Product management
│   │   ├── middleware/
│   │   │   └── auth.js               # JWT authentication middleware
│   │   ├── models/
│   │   │   ├── UserSqlite.js         # User model (SQLite)
│   │   │   └── ProductSqlite.js      # Product model (SQLite)
│   │   ├── routes/
│   │   │   ├── authRoutes.js         # Authentication routes
│   │   │   ├── productRoutes.js      # Product routes
│   │   │   └── api.js                # API routes
│   │   └── app.js                    # Express application
│   ├── init-db-sqlite.js             # Database initialization
│   ├── .env                          # Environment variables
│   └── package.json
├── components/
│   └── Navbar.tsx
├── pages/
│   ├── Contact.tsx
│   ├── Dashboard.tsx
│   ├── Home.tsx
│   └── Products.tsx
├── services/
│   ├── authService.ts
│   ├── productService.ts
│   └── geminiService.ts
├── App.tsx
├── index.tsx
├── package.json
└── vite.config.ts
```

## Development

### Frontend Development
- Uses Vite for fast development and hot reloading
- TypeScript for type safety
- Tailwind CSS for styling
- React Router for navigation

### Backend Development
- Express.js server with RESTful API
- SQLite database for development
- JWT-based authentication
- Role-based access control

## Testing

You can test the application by:

1. Opening the frontend at `http://localhost:3000`
2. Using the default admin credentials to log in
3. Testing different user roles and functionalities
4. Creating new users through the signup page
5. Managing products through the admin dashboard

## Deployment

For production deployment:

1. Update environment variables in `.env` file
2. Use a production database (MySQL/PostgreSQL)
3. Build the frontend: `npm run build`
4. Serve the built files through a web server
5. Deploy the backend to a Node.js hosting service

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is proprietary software for Toffan Glass Solutions. 