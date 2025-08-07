# FundRaise Platform Setup Guide

This guide will help you set up the FundRaise platform with AWS SES for email, AWS S3 for file uploads, and Drizzle ORM for the database.

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database
3. **AWS Account** with:
   - S3 bucket for file storage
   - SES configured for email sending
   - IAM user with appropriate permissions

## AWS Setup

### 1. Create S3 Bucket
```bash
# Create an S3 bucket (replace 'your-bucket-name' with your desired name)
aws s3 mb s3://your-bucket-name --region us-east-1

# Configure bucket for public read access (for uploaded files)
aws s3api put-bucket-policy --bucket your-bucket-name --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    }
  ]
}'
```

### 2. Configure SES
```bash
# Verify your domain/email in SES
aws ses verify-email-identity --email-address noreply@yourdomain.com

# If using sandbox mode, also verify recipient emails
aws ses verify-email-identity --email-address recipient@example.com
```

### 3. Create IAM User
Create an IAM user with the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:PutObjectAcl"
      ],
      "Resource": "arn:aws:s3:::your-bucket-name/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "ses:SendEmail",
        "ses:SendTemplatedEmail",
        "ses:SendRawEmail"
      ],
      "Resource": "*"
    }
  ]
}
```

## Installation

### 1. Backend Setup
```bash
cd backend

# Install dependencies (already done)
npm install

# Copy environment file and configure
cp .env.example .env
# Edit .env with your actual values

# Set up database
createdb fundraise_db  # Create PostgreSQL database

# Run migrations
npm run db:migrate

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend

# Install dependencies (already done)
npm install

# Start development server
npm run dev
```

## Environment Configuration

### Backend (.env)
Update these values in `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/fundraise_db

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_access_key_here

# AWS S3
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_S3_REGION=us-east-1

# AWS SES
SES_FROM_EMAIL=noreply@yourdomain.com
SES_FROM_NAME=FundRaise Platform

# JWT
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Frontend URL
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
Update `frontend/.env`:

```env
VITE_API_URL=http://localhost:3001
```

## Database Schema

The platform includes the following tables:
- **users**: User accounts and authentication
- **campaigns**: Fundraising campaigns
- **donations**: Donation records
- **campaign_updates**: Campaign progress updates
- **comments**: Campaign comments
- **likes**: Campaign likes
- **follows**: Campaign followers

## Features Implemented

### Backend Features
✅ **Authentication System**
- User registration with email verification
- Login/logout with JWT tokens
- Password reset functionality
- Protected routes with middleware

✅ **AWS S3 Integration**
- File upload with signed URLs
- Direct upload support
- File deletion
- Multiple file upload support
- File type validation

✅ **AWS SES Integration**
- Welcome emails
- Password reset emails
- Campaign approval notifications
- Donation receipt emails
- Template-based email system

✅ **Campaign Management**
- Create, read, update, delete campaigns
- Campaign approval workflow
- File upload integration
- Search and filtering
- Pagination

✅ **Database with Drizzle ORM**
- Type-safe database operations
- Automated migrations
- PostgreSQL support
- Relationship management

### Frontend Features
✅ **File Upload Component**
- Drag and drop interface
- Multiple file support
- Upload progress tracking
- File type validation
- AWS S3 integration

✅ **Campaign Creation Form**
- Multi-step form
- Form validation
- File upload integration
- Real-time preview

✅ **API Service Layer**
- Centralized API calls
- Error handling
- Authentication integration

## Security Features

- **Input Validation**: All user inputs are validated
- **Authentication**: JWT-based authentication
- **Authorization**: Route-level protection
- **File Upload Security**: File type and size validation
- **SQL Injection Protection**: Parameterized queries with Drizzle
- **CORS Protection**: Configured for frontend domain
- **Password Hashing**: bcryptjs with salt rounds
- **Environment Variables**: Sensitive data in environment files

## Performance Optimizations

- **Database Indexing**: Proper indexes on frequently queried fields
- **Pagination**: All list endpoints support pagination
- **File Upload**: Direct S3 upload to reduce server load
- **Query Optimization**: Efficient database queries with Drizzle
- **Error Handling**: Comprehensive error handling and logging

## Next Steps

1. **Set up your AWS resources** (S3 bucket, SES, IAM user)
2. **Configure your environment variables**
3. **Set up PostgreSQL database**
4. **Run database migrations**
5. **Start both backend and frontend servers**
6. **Test the complete workflow**

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Email verification
- `POST /api/auth/forgot-password` - Password reset request
- `POST /api/auth/reset-password` - Password reset

### Campaigns
- `GET /api/campaigns` - List campaigns
- `GET /api/campaigns/:id` - Get campaign details
- `POST /api/campaigns` - Create campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `PUT /api/users/password` - Change password
- `GET /api/users/campaigns` - Get user's campaigns
- `GET /api/users/donations` - Get user's donations
- `GET /api/users/dashboard` - Get dashboard data

### File Upload
- `POST /api/upload/signed-url` - Get signed upload URL
- `POST /api/upload/direct` - Direct file upload
- `POST /api/upload/multiple` - Multiple file upload
- `DELETE /api/upload/:fileKey` - Delete file

## Support

For any issues or questions, please check the code comments and error logs. The system includes comprehensive error handling and logging to help with debugging.
