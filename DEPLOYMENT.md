# Vercel Deployment Guide

This guide will help you deploy the Fundraise platform to Vercel.

## Prerequisites

1. **GitHub Repository**: Push your code to a GitHub repository
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: Set up a PostgreSQL database (we recommend [Neon](https://neon.tech) or [Supabase](https://supabase.com))
4. **AWS Account**: For S3 and SES services
5. **Stripe Account**: For payment processing

## Step 1: Prepare Environment Variables

You'll need to set these environment variables in Vercel:

### Backend Environment Variables
```
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# JWT
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_S3_BUCKET_NAME=your-s3-bucket-name
AWS_SES_FROM_EMAIL=noreply@yourdomain.com

# Stripe
STRIPE_SECRET_KEY=sk_live_... (or sk_test_... for testing)
STRIPE_WEBHOOK_SECRET=whsec_...

# App Configuration
FRONTEND_URL=https://your-app.vercel.app
NODE_ENV=production
```

### Frontend Environment Variables
```
# API Configuration
VITE_API_URL=https://your-app.vercel.app

# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_... (or pk_test_... for testing)

# App Configuration
VITE_APP_NAME=Fundraise Platform
VITE_APP_URL=https://your-app.vercel.app
```

## Step 2: Deploy to Vercel

1. **Connect GitHub Repository**:
   - Go to [vercel.com/dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository

2. **Configure Project Settings**:
   - **Framework Preset**: Other
   - **Root Directory**: Leave empty (monorepo setup)
   - **Build Command**: Leave empty (handled by vercel.json)
   - **Output Directory**: Leave empty (handled by vercel.json)

3. **Set Environment Variables**:
   - In your Vercel project dashboard, go to "Settings" → "Environment Variables"
   - Add all the environment variables listed above
   - Make sure to set them for "Production", "Preview", and "Development" environments

4. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

## Step 3: Configure Database

1. **Run Migrations**:
   - After deployment, you need to run database migrations
   - You can do this locally by setting your production DATABASE_URL:
   ```bash
   cd backend
   DATABASE_URL="your-production-db-url" npm run db:migrate
   ```

2. **Seed Database** (Optional):
   - To populate initial data:
   ```bash
   cd backend
   DATABASE_URL="your-production-db-url" npm run db:seed
   ```

## Step 4: Configure Stripe Webhooks

1. **Go to Stripe Dashboard**:
   - Navigate to "Developers" → "Webhooks"
   - Click "Add endpoint"

2. **Set Webhook URL**:
   - URL: `https://your-app.vercel.app/api/donations/webhook`
   - Events to send: `payment_intent.succeeded`, `payment_intent.payment_failed`

3. **Get Webhook Secret**:
   - Copy the webhook secret (starts with `whsec_`)
   - Add it to your Vercel environment variables as `STRIPE_WEBHOOK_SECRET`

## Step 5: Configure AWS Services

### S3 Bucket Setup
1. Create an S3 bucket for file uploads
2. Configure bucket CORS policy:
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST", "DELETE", "HEAD"],
    "AllowedOrigins": ["https://your-app.vercel.app"],
    "ExposeHeaders": ["ETag"]
  }
]
```

### SES Setup
1. Verify your sender email address in AWS SES
2. If using a custom domain, verify the domain
3. Request production access if needed (to send emails to unverified addresses)

## Step 6: Post-Deployment Verification

1. **Test API Endpoints**:
   - Visit `https://your-app.vercel.app/api/health`
   - Should return `{"status": "OK", ...}`

2. **Test Frontend**:
   - Visit `https://your-app.vercel.app`
   - Verify the homepage loads correctly

3. **Test Authentication**:
   - Try registering a new account
   - Check your email for verification

4. **Test File Upload**:
   - Try creating a campaign with images
   - Verify files upload to S3

5. **Test Payments**:
   - Make a test donation
   - Check Stripe dashboard for payment

## Troubleshooting

### Common Issues

1. **API Routes Not Working**:
   - Check Vercel function logs in the dashboard
   - Verify environment variables are set correctly

2. **Database Connection Issues**:
   - Ensure DATABASE_URL is correct
   - Check if your database allows connections from Vercel IPs

3. **File Upload Issues**:
   - Verify AWS credentials and S3 bucket configuration
   - Check CORS policy on your S3 bucket

4. **Email Not Sending**:
   - Verify SES configuration and sender email
   - Check if you're still in SES sandbox mode

5. **Stripe Payments Failing**:
   - Verify Stripe keys are correct (test vs live)
   - Check webhook configuration and secret

### Getting Help

- Check Vercel function logs: Project Dashboard → Functions → View Function Logs
- Check browser console for frontend errors
- Review AWS CloudWatch logs for AWS service issues
- Check Stripe dashboard for payment-related issues

## Custom Domain (Optional)

1. **Add Domain in Vercel**:
   - Go to Project Settings → Domains
   - Add your custom domain

2. **Update Environment Variables**:
   - Update `FRONTEND_URL` and `VITE_APP_URL` to use your custom domain
   - Update CORS origins in your backend if needed

3. **Update Stripe Webhook**:
   - Update webhook URL to use your custom domain

## Security Considerations

- All sensitive data is in environment variables (not in code)
- JWT tokens are properly secured
- CORS is configured for your domain only
- HTTPS is enforced by Vercel
- Stripe webhook signatures are verified

Your fundraising platform should now be fully deployed and functional on Vercel!
