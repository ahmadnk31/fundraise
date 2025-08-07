# Vercel Deployment Checklist

## Pre-Deployment

- [ ] All secrets are in environment variables (not hardcoded)
- [ ] `.env` files are in `.gitignore`
- [ ] Code is pushed to GitHub repository
- [ ] Database is set up (Neon, Supabase, or other PostgreSQL provider)
- [ ] AWS S3 bucket is created and configured
- [ ] AWS SES is configured and verified
- [ ] Stripe account is set up

## Vercel Project Setup

- [ ] Import GitHub repository to Vercel
- [ ] Set all environment variables in Vercel dashboard
- [ ] Configure for Production, Preview, and Development environments

## Environment Variables to Set

### Backend (.env)
- [ ] `DATABASE_URL`
- [ ] `JWT_SECRET`
- [ ] `JWT_EXPIRES_IN`
- [ ] `AWS_REGION`
- [ ] `AWS_ACCESS_KEY_ID`
- [ ] `AWS_SECRET_ACCESS_KEY`
- [ ] `AWS_S3_BUCKET_NAME`
- [ ] `AWS_SES_FROM_EMAIL`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `FRONTEND_URL`
- [ ] `NODE_ENV=production`

### Frontend (.env.production)
- [ ] `VITE_API_URL`
- [ ] `VITE_STRIPE_PUBLISHABLE_KEY`
- [ ] `VITE_APP_NAME`
- [ ] `VITE_APP_URL`

## Post-Deployment

- [ ] Run database migrations
- [ ] Seed database (optional)
- [ ] Configure Stripe webhooks
- [ ] Test API health endpoint (`/api/health`)
- [ ] Test frontend application
- [ ] Test user registration and email verification
- [ ] Test campaign creation and file upload
- [ ] Test donation flow and Stripe payments

## Domain Setup (Optional)

- [ ] Add custom domain in Vercel
- [ ] Update environment variables with new domain
- [ ] Update Stripe webhook URLs
- [ ] Update AWS S3 CORS policy

## Monitoring

- [ ] Check Vercel function logs
- [ ] Monitor database connections
- [ ] Check AWS CloudWatch logs
- [ ] Monitor Stripe dashboard

## Security Verification

- [ ] All sensitive data is in environment variables
- [ ] HTTPS is enforced
- [ ] CORS is properly configured
- [ ] JWT tokens are secure
- [ ] Stripe webhook signatures are verified
- [ ] AWS credentials are properly scoped

Your app should be live at: `https://your-project.vercel.app`
