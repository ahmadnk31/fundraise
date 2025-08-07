import Stripe from 'stripe';
import { db } from '../db/index.js';
import { campaigns, payouts, transactions, platformSettings, donations } from '../db/schema.js';
import { eq, and, sql, desc } from 'drizzle-orm';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-07-30.basil',
});

export class PayoutService {
  
  // Get platform settings
  async getPlatformSettings() {
    const settings = await db.select().from(platformSettings);
    const settingsMap = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {} as Record<string, string>);

    return {
      platformFeePercentage: parseFloat(settingsMap.platform_fee_percentage || '5.0'),
      stripeProcessingFeePercentage: parseFloat(settingsMap.stripe_processing_fee_percentage || '2.9'),
      stripeProcessingFeeFixed: parseFloat(settingsMap.stripe_processing_fee_fixed || '0.30'),
      minimumPayoutAmount: parseFloat(settingsMap.minimum_payout_amount || '25.00'),
      payoutHoldingPeriodDays: parseInt(settingsMap.payout_holding_period_days || '7'),
      autoPayoutEnabled: settingsMap.auto_payout_enabled === 'true',
    };
  }

  // Calculate fees for a donation
  calculateFees(amount: number, settings: any) {
    // Stripe processing fee: percentage + fixed fee
    const stripeProcessingFee = (amount * settings.stripeProcessingFeePercentage / 100) + settings.stripeProcessingFeeFixed;
    
    // Platform fee: percentage of the original amount
    const platformFee = amount * settings.platformFeePercentage / 100;
    
    // Net amount after all fees
    const netAmount = amount - stripeProcessingFee - platformFee;

    return {
      platformFee: Math.round(platformFee * 100) / 100,
      processingFee: Math.round(stripeProcessingFee * 100) / 100,
      netAmount: Math.round(netAmount * 100) / 100,
    };
  }

  // Process a successful donation and update campaign balance
  async processDonation(donationId: string) {
    try {
      const donation = await db.query.donations.findFirst({
        where: eq(donations.id, donationId),
        with: {
          campaign: true,
        },
      });

      if (!donation || donation.status !== 'completed') {
        throw new Error('Donation not found or not completed');
      }

      const settings = await this.getPlatformSettings();
      const amount = parseFloat(donation.amount);
      const fees = this.calculateFees(amount, settings);

      // Create transaction record
      await db.insert(transactions).values({
        campaignId: donation.campaignId,
        donationId: donation.id,
        type: 'donation',
        amount: donation.amount,
        platformFee: fees.platformFee.toFixed(2),
        processingFee: fees.processingFee.toFixed(2),
        netAmount: fees.netAmount.toFixed(2),
        currency: donation.currency,
        status: 'completed',
        description: `Donation from ${donation.donorName || donation.donorEmail}`,
      });

      // Update campaign balance
      await db
        .update(campaigns)
        .set({
          availableBalance: sql`available_balance + ${fees.netAmount}`,
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, donation.campaignId));

      return { success: true, netAmount: fees.netAmount };
    } catch (error) {
      console.error('Error processing donation:', error);
      throw error;
    }
  }

  // Get available balance for a campaign
  async getCampaignBalance(campaignId: string) {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      columns: {
        id: true,
        availableBalance: true,
        paidOut: true,
        currentAmount: true,
      },
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const settings = await this.getPlatformSettings();
    const availableBalance = parseFloat(campaign.availableBalance);
    const canPayout = availableBalance >= settings.minimumPayoutAmount;

    return {
      availableBalance,
      paidOut: parseFloat(campaign.paidOut),
      totalRaised: parseFloat(campaign.currentAmount),
      minimumPayoutAmount: settings.minimumPayoutAmount,
      canPayout,
    };
  }

  // Create a payout request
  async requestPayout(campaignId: string, userId: string, paymentMethod: 'stripe' | 'paypal' | 'bank_transfer', paymentDetails: any) {
    try {
      // Verify campaign ownership
      const campaign = await db.query.campaigns.findFirst({
        where: and(eq(campaigns.id, campaignId), eq(campaigns.userId, userId)),
      });

      if (!campaign) {
        throw new Error('Campaign not found or access denied');
      }

      const balance = await this.getCampaignBalance(campaignId);
      
      if (!balance.canPayout) {
        throw new Error(`Minimum payout amount is $${balance.minimumPayoutAmount}`);
      }

      const settings = await this.getPlatformSettings();
      const amount = balance.availableBalance;
      
      // For demonstration, we'll assume no additional fees for payouts
      // In practice, you might have payout processing fees
      const netAmount = amount;

      // Create payout record
      const [payout] = await db
        .insert(payouts)
        .values({
          campaignId,
          userId,
          amount: amount.toFixed(2),
          platformFee: '0.00', // No additional platform fee on payout
          processingFee: '0.00', // You might add payout processing fees here
          netAmount: netAmount.toFixed(2),
          currency: campaign.currency,
          status: 'pending',
          paymentMethod,
          bankAccount: paymentMethod === 'bank_transfer' ? paymentDetails : null,
          paypalEmail: paymentMethod === 'paypal' ? paymentDetails.email : null,
        })
        .returning();

      // Update campaign balance (reserve the amount)
      await db
        .update(campaigns)
        .set({
          availableBalance: '0.00',
          updatedAt: new Date(),
        })
        .where(eq(campaigns.id, campaignId));

      // Create transaction record
      await db.insert(transactions).values({
        campaignId,
        payoutId: payout.id,
        type: 'payout',
        amount: amount.toFixed(2),
        platformFee: '0.00',
        processingFee: '0.00',
        netAmount: netAmount.toFixed(2),
        currency: campaign.currency,
        status: 'pending',
        description: `Payout request via ${paymentMethod}`,
      });

      return payout;
    } catch (error) {
      console.error('Error creating payout request:', error);
      throw error;
    }
  }

  // Process payout via Stripe Connect (if using Stripe)
  async processStripePayout(payoutId: string) {
    try {
      const payout = await db.query.payouts.findFirst({
        where: eq(payouts.id, payoutId),
        with: {
          campaign: true,
          user: true,
        },
      });

      if (!payout || payout.status !== 'pending') {
        throw new Error('Payout not found or already processed');
      }

      if (!payout.campaign.stripeConnectAccountId) {
        throw new Error('Stripe Connect account not set up for this campaign');
      }

      // Create Stripe transfer
      const transfer = await stripe.transfers.create({
        amount: Math.round(parseFloat(payout.netAmount) * 100), // Convert to cents
        currency: payout.currency.toLowerCase(),
        destination: payout.campaign.stripeConnectAccountId,
        description: `Payout for campaign: ${payout.campaign.title}`,
        metadata: {
          payoutId: payout.id,
          campaignId: payout.campaignId,
        },
      });

      // Update payout status
      await db
        .update(payouts)
        .set({
          status: 'processing',
          stripeTransferId: transfer.id,
          processedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(payouts.id, payoutId));

      // Update transaction status
      await db
        .update(transactions)
        .set({
          status: 'processing',
          metadata: { stripeTransferId: transfer.id },
          updatedAt: new Date(),
        })
        .where(eq(transactions.payoutId, payoutId));

      return { success: true, transferId: transfer.id };
    } catch (error) {
      console.error('Error processing Stripe payout:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Mark payout as failed
      await db
        .update(payouts)
        .set({
          status: 'failed',
          failureReason: errorMessage,
          updatedAt: new Date(),
        })
        .where(eq(payouts.id, payoutId));

      throw error;
    }
  }

  // Handle Stripe webhook for transfer completion
  async handleStripeTransferWebhook(event: any) {
    try {
      if (event.type === 'transfer.paid') {
        const transfer = event.data.object;
        const payoutId = transfer.metadata?.payoutId;

        if (payoutId) {
          await db
            .update(payouts)
            .set({
              status: 'completed',
              completedAt: new Date(),
              updatedAt: new Date(),
            })
            .where(eq(payouts.id, payoutId));

          await db
            .update(transactions)
            .set({
              status: 'completed',
              updatedAt: new Date(),
            })
            .where(eq(transactions.payoutId, payoutId));

          // Update campaign paid out amount
          const payout = await db.query.payouts.findFirst({
            where: eq(payouts.id, payoutId),
          });

          if (payout) {
            await db
              .update(campaigns)
              .set({
                paidOut: sql`paid_out + ${parseFloat(payout.netAmount)}`,
                updatedAt: new Date(),
              })
              .where(eq(campaigns.id, payout.campaignId));
          }
        }
      } else if (event.type === 'transfer.failed') {
        const transfer = event.data.object;
        const payoutId = transfer.metadata?.payoutId;

        if (payoutId) {
          const payout = await db.query.payouts.findFirst({
            where: eq(payouts.id, payoutId),
          });

          if (payout) {
            // Mark as failed
            await db
              .update(payouts)
              .set({
                status: 'failed',
                failureReason: 'Stripe transfer failed',
                updatedAt: new Date(),
              })
              .where(eq(payouts.id, payoutId));

            // Restore campaign balance
            await db
              .update(campaigns)
              .set({
                availableBalance: sql`available_balance + ${parseFloat(payout.netAmount)}`,
                updatedAt: new Date(),
              })
              .where(eq(campaigns.id, payout.campaignId));
          }
        }
      }
    } catch (error) {
      console.error('Error handling Stripe transfer webhook:', error);
      throw error;
    }
  }

  // Get payout history for a user
  async getPayoutHistory(userId: string, page = 1, limit = 10) {
    const offset = (page - 1) * limit;

    const userPayouts = await db.query.payouts.findMany({
      where: eq(payouts.userId, userId),
      with: {
        campaign: {
          columns: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: [desc(payouts.createdAt)],
      limit,
      offset,
    });

    const total = await db
      .select({ count: sql<number>`count(*)` })
      .from(payouts)
      .where(eq(payouts.userId, userId));

    return {
      payouts: userPayouts,
      pagination: {
        page,
        limit,
        total: total[0].count,
        totalPages: Math.ceil(total[0].count / limit),
      },
    };
  }

  // Get financial overview for a campaign
  async getCampaignFinancials(campaignId: string) {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const transactionHistory = await db.query.transactions.findMany({
      where: eq(transactions.campaignId, campaignId),
      orderBy: [desc(transactions.createdAt)],
      limit: 50,
    });

    const totalRaised = parseFloat(campaign.currentAmount);
    const availableBalance = parseFloat(campaign.availableBalance);
    const paidOut = parseFloat(campaign.paidOut);

    // Calculate total fees
    const totalPlatformFees = transactionHistory
      .filter(t => t.type === 'donation')
      .reduce((sum, t) => sum + parseFloat(t.platformFee), 0);

    const totalProcessingFees = transactionHistory
      .filter(t => t.type === 'donation')
      .reduce((sum, t) => sum + parseFloat(t.processingFee), 0);

    return {
      totalRaised,
      availableBalance,
      paidOut,
      totalPlatformFees,
      totalProcessingFees,
      netReceived: totalRaised - totalPlatformFees - totalProcessingFees,
      transactions: transactionHistory,
    };
  }
}

export const payoutService = new PayoutService();
