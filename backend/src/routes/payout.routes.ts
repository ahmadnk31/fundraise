import { Router } from 'express';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { payoutService } from '../services/payout.service.js';
import { db } from '../db/index.js';
import { campaigns } from '../db/schema.js';
import { eq, and } from 'drizzle-orm';

const router = Router();

// Validation schemas
const payoutRequestSchema = z.object({
  campaignId: z.string().uuid(),
  paymentMethod: z.enum(['stripe', 'paypal', 'bank_transfer']),
  paymentDetails: z.object({
    email: z.string().email().optional(),
    accountNumber: z.string().optional(),
    routingNumber: z.string().optional(),
    bankName: z.string().optional(),
    accountType: z.enum(['checking', 'savings']).optional(),
  }).optional(),
});

// Get campaign financial overview
router.get('/campaign/:campaignId/financials', authMiddleware, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    // Verify campaign ownership
    const campaign = await db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)),
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or access denied',
      });
    }

    const financials = await payoutService.getCampaignFinancials(campaignId);

    res.json({
      success: true,
      data: financials,
    });
  } catch (error) {
    console.error('Get campaign financials error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign financials',
    });
  }
});

// Get campaign balance
router.get('/campaign/:campaignId/balance', authMiddleware, async (req, res) => {
  try {
    const { campaignId } = req.params;
    const userId = req.user!.id;

    // Verify campaign ownership
    const campaign = await db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)),
    });

    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: 'Campaign not found or access denied',
      });
    }

    const balance = await payoutService.getCampaignBalance(campaignId);

    res.json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error('Get campaign balance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get campaign balance',
    });
  }
});

// Request payout
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const validatedData = payoutRequestSchema.parse(req.body);
    const userId = req.user!.id;

    const payout = await payoutService.requestPayout(
      validatedData.campaignId,
      userId,
      validatedData.paymentMethod,
      validatedData.paymentDetails
    );

    res.status(201).json({
      success: true,
      data: payout,
      message: 'Payout requested successfully',
    });
  } catch (error) {
    console.error('Request payout error:', error);
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: error.issues,
      });
    }

    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to request payout',
    });
  }
});

// Process payout (admin only or automated)
router.post('/:payoutId/process', authMiddleware, async (req, res) => {
  try {
    const { payoutId } = req.params;

    // In a real app, you'd check if user is admin or this would be called automatically
    const result = await payoutService.processStripePayout(payoutId);

    res.json({
      success: true,
      data: result,
      message: 'Payout processing initiated',
    });
  } catch (error) {
    console.error('Process payout error:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to process payout',
    });
  }
});

// Get payout history for user
router.get('/history', authMiddleware, async (req, res) => {
  try {
    const userId = req.user!.id;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const history = await payoutService.getPayoutHistory(userId, page, limit);

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    console.error('Get payout history error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get payout history',
    });
  }
});

// Get platform fee settings (public)
router.get('/settings', async (req, res) => {
  try {
    const settings = await payoutService.getPlatformSettings();

    // Only return public settings
    res.json({
      success: true,
      data: {
        platformFeePercentage: settings.platformFeePercentage,
        stripeProcessingFeePercentage: settings.stripeProcessingFeePercentage,
        stripeProcessingFeeFixed: settings.stripeProcessingFeeFixed,
        minimumPayoutAmount: settings.minimumPayoutAmount,
      },
    });
  } catch (error) {
    console.error('Get platform settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get platform settings',
    });
  }
});

// Stripe webhook for transfer events
router.post('/webhook/stripe', async (req, res) => {
  try {
    const event = req.body;

    // In production, you should verify the webhook signature
    // const sig = req.headers['stripe-signature'];
    // const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);

    await payoutService.handleStripeTransferWebhook(event);

    res.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook error:', error);
    res.status(400).json({
      success: false,
      message: 'Webhook error',
    });
  }
});

export default router;
