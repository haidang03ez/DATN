# Nền tảng Thương mại điện tử BookShop

Hệ thống bán sách trực tuyến với ba phần riêng biệt: Quản trị viên, Khách hàng và Server.

## Cấu trúc dự án

```text
300525_BookShop/
├── Admin/          # Ứng dụng quản trị
├── Customer/       # Giao diện người dùng
└── Server/         # Backend API server
```

## Tính năng chính

### Giao diện khách hàng
- Tìm kiếm và duyệt sản phẩm
- Quản lý giỏ hàng 
- Đặt hàng và theo dõi đơn hàng
- Đánh giá và xếp hạng sản phẩm
- Xem blog và video
- Quản lý tài khoản cá nhân
- Yêu cầu trả/hủy đơn hàng

### Trang quản trị
- Quản lý sản phẩm (CRUD)
- Quản lý đơn hàng
- Quản lý người dùng
- Quản lý danh mục 
- Kiểm soát kho
- Quản lý khuyến mãi
- Quản lý nhà cung cấp
- Thống kê và báo cáo
- Quản lý blog và video

### Tính năng Backend
- API RESTful
- Xác thực JWT
- Upload file
- Cơ sở dữ liệu MongoDB
- Server Express
- Middleware xác thực và xử lý lỗi

## Công nghệ sử dụng

### Frontend (Admin & Customer)
- React.js
- Redux quản lý state
- React Router điều hướng
- Ant Design (UI Admin)
- CSS responsive

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose ODM
- JWT
- Cloudinary
- Express-async-handler

## Hướng dẫn cài đặt

### Yêu cầu hệ thống
- Node.js v14 trở lên
- MongoDB
- NPM/Yarn

### Các bước cài đặt

1. Clone dự án:
```bash
git clone https://github.com/yourusername/300525_BookShop.git
```

2. Cài đặt Server:
```bash
cd Server
npm install
cp .env.example .env
npm start
```

3. Cài đặt Admin:
```bash
cd Admin
npm install
npm start
```

4. Cài đặt Customer:
```bash
cd Customer
npm install
npm start
```

### Biến môi trường (.env)
```env
PORT=5000
MONGO_URL=mongodb://localhost:27017/bookshop
JWT_SECRET=your_secret
CLOUDINARY_NAME=your_name
CLOUDINARY_KEY=your_key
CLOUDINARY_SECRET=your_secret
```

## API Endpoints
Các endpoint chính:
- `/api/products` - Quản lý sản phẩm
- `/api/users` - Quản lý người dùng
- `/api/orders` - Quản lý đơn hàng
- `/api/categories` - Quản lý danh mục
- `/api/upload` - Upload file
- `/api/stats` - Thống kê
- `/api/promotions` - Quản lý khuyến mãi
- `/api/suppliers` - Quản lý nhà cung cấp

## Giấy phép

ISC

## Tác giả
Nguyễn Hải Đăng

## Liên hệ
Email: haidanghaui2021@gmail.com

## Phiên bản
1.0.0

## Lưu ý
- Đảm bảo cấu hình đúng biến môi trường trước khi chạy
- Yêu cầu kết nối internet để sử dụng Cloudinary
- Khuyến nghị sử dụng Node.js phiên bản LTS

---------------------------------------------------------------------------------------------------------------


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
Email: haidanghaui2021@gmail.com
