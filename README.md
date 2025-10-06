🚀 Features
# this app generates and stores users accounts details.

🛡️ Secure Password Generation - Strong, customizable password generator
📱 Clean & Minimal UI - Fast, intuitive interface
🔍 Search & Filter - Quickly find your saved accounts
📋 Auto-Clear Clipboard - Passwords are automatically cleared after 15 seconds
🌓 Privacy First - Server only stores encrypted blobs

🛠️ Tech Stack
Frontend
React - UI framework
Tailwind CSS - Styling
CryptoJS - Client-side encryption
Axios - HTTP client

Backend
Node.js - Runtime environment
Express.js - Web framework
PostgreSQL - Database
Prisma - ORM
JWT - Authentication
bcrypt - Password hashing

🔐 Security Implementation

Current Security Features
Client-Side Encryption - All vault data encrypted with AES-256 before sending to server
Password Hashing - User passwords hashed with bcrypt (12 rounds)
JWT Authentication - Stateless authentication with short-lived tokens
CORS Protection - Configured for specific origins
Input Validation - Basic server-side validation

📦 Installation
Prerequisites
Node.js 16+
PostgreSQL
npm or yarn
Backend Setup
bash
cd backend
npm install

# Setup environment variables
# Edit .env with your database and JWT secret

# Database setup
npx prisma generate
npx prisma db push

# Start server
npm run dev
Frontend Setup
bash
cd frontend
npm install

# Setup environment
# Edit .env with your API URL

# Start development server
npm run dev
🗄️ Database Schema
sql
Users
- id (UUID)
- email (String, Unique)
- username (String, Unique) 
- password (String - hashed)
- createdAt (DateTime)
- updatedAt (DateTime)

VaultItems
- id (UUID)
- userId (String)
- encryptedData (String - AES encrypted)
- createdAt (DateTime)
- updatedAt (DateTime)
- 
🔧 API Endpoints
Authentication
POST /api/signup - User registration
POST /api/login - User login

Vault Operations
GET /api/vault/items - Get user's vault items
POST /api/vault/items - Create new vault item
DELETE /api/vault/items/:id - Delete vault item

🚨 Security Considerations & Future Improvements
⚠️ Current Security Gaps
1. CSRF Protection ❌ Missing
Risk: Cross-Site Request Forgery attacks

2. XSS Protection ❌ Basic
Risk: Cross-Site Scripting attacks
