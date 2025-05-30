










# BookShop E-commerce Platform
A full-stack e-commerce platform for books with separate Admin, Customer, and Server applications.

## Project Structure
```
├── Admin/          # Admin dashboard application
├── Customer/       # Customer-facing storefront
└── Server/         # Backend API server
```

## Features

### Customer Portal
- User authentication (login/register)
- Product browsing and searching
- Shopping cart management
- Order placement and tracking
- Product reviews and ratings
- Blog section
- Profile management
- Return/cancel order requests

### Admin Dashboard
- Product management (CRUD operations)
- Order management
- User management
- Category management
- Inventory management
- Promotion management
- Supplier management
- Statistics and analytics
- Blog management
- Video content management

### Backend Features
- RESTful API
- JWT authentication
- File upload handling
- MongoDB database integration
- Express server
- Middleware for auth and error handling

## Technology Stack

### Frontend (Admin & Customer)
- React.js
- Redux for state management
- React Router for navigation
- Ant Design (Admin UI components)
- CSS for responsive design

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT for authentication
- Cloudinary for file storage
- Express-async-handler
- CORS support

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- NPM or Yarn

### Installation

1. Clone the repository
```bash
git clone <repository-url>
```

2. Server Setup
```bash
cd Server
npm install
cp .env.example .env
# Configure your environment variables
npm start
```

3. Admin Dashboard Setup
```bash
cd Admin
npm install
npm start
```

4. Customer Portal Setup
```bash
cd Customer
npm install
npm start
```

### Environment Variables (Server/.env)
```
PORT=5000
MONGO_URL=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## API Routes

The server provides various API endpoints:
- `/api/products` - Product management
- `/api/users` - User management
- `/api/orders` - Order management
- `/api/categories` - Category management
- `/api/upload` - File upload handling
- `/api/statistics` - Analytics and reports
- `/api/promotions` - Promotion management
- `/api/suppliers` - Supplier management

## Deployment

- Frontend applications are configured for Vercel deployment
- Backend can be deployed to any Node.js hosting platform

## License

ISC License

## Authors

Hai Dang Nguyen
