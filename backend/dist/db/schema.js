import { pgTable, text, uuid, timestamp, boolean, decimal, jsonb } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
export const users = pgTable('users', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    email: text('email').notNull().unique(),
    password: text('password').notNull(),
    firstName: text('first_name').notNull(),
    lastName: text('last_name').notNull(),
    avatar: text('avatar'),
    isVerified: boolean('is_verified').default(false).notNull(),
    verificationToken: text('verification_token'),
    resetPasswordToken: text('reset_password_token'),
    resetPasswordExpires: timestamp('reset_password_expires'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const campaigns = pgTable('campaigns', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    slug: text('slug').notNull().unique(),
    summary: text('summary').notNull(),
    story: text('story').notNull(),
    category: text('category').notNull(),
    location: text('location'),
    goalAmount: decimal('goal_amount', { precision: 12, scale: 2 }).notNull(),
    currentAmount: decimal('current_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
    currency: text('currency').default('USD').notNull(),
    deadline: timestamp('deadline'),
    budgetBreakdown: text('budget_breakdown'),
    coverImage: text('cover_image'),
    additionalMedia: jsonb('additional_media').$type().default([]),
    isActive: boolean('is_active').default(true).notNull(),
    isFeatured: boolean('is_featured').default(false).notNull(),
    isApproved: boolean('is_approved').default(false).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const donations = pgTable('donations', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
    donorId: uuid('donor_id').references(() => users.id, { onDelete: 'set null' }),
    amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
    currency: text('currency').default('USD').notNull(),
    donorName: text('donor_name'),
    donorEmail: text('donor_email'),
    message: text('message'),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    paymentMethod: text('payment_method').notNull(),
    paymentIntentId: text('payment_intent_id'),
    status: text('status').notNull().default('pending'), // pending, completed, failed, refunded
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const campaignUpdates = pgTable('campaign_updates', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
    title: text('title').notNull(),
    content: text('content').notNull(),
    images: jsonb('images').$type().default([]),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const comments = pgTable('comments', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    content: text('content').notNull(),
    parentId: uuid('parent_id'),
    isApproved: boolean('is_approved').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const likes = pgTable('likes', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
export const follows = pgTable('follows', {
    id: uuid('id').primaryKey().default(sql `gen_random_uuid()`),
    campaignId: uuid('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
});
//# sourceMappingURL=schema.js.map