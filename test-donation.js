#!/usr/bin/env node

import fetch from 'node-fetch';

const API_BASE_URL = 'http://localhost:3001';
const campaignId = '4ddb65dd-cf01-49d5-8922-60b317195919';

async function testDonationFlow() {
  console.log('🚀 Testing donation flow...\n');

  try {
    // Step 1: Create payment intent
    console.log('1. Creating payment intent...');
    const paymentIntentResponse = await fetch(`${API_BASE_URL}/api/donations/create-payment-intent`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId,
        amount: 25,
        donorName: 'Test Donor',
        donorEmail: 'test@example.com',
      }),
    });

    const paymentIntentData = await paymentIntentResponse.json();
    console.log('Payment intent response:', paymentIntentData);

    if (!paymentIntentData.success) {
      throw new Error('Failed to create payment intent');
    }

    const { paymentIntentId } = paymentIntentData.data;
    console.log('✅ Payment intent created:', paymentIntentId);

    // Step 2: Try to create donation (this will likely fail because payment isn't actually processed)
    console.log('\n2. Attempting to create donation...');
    const donationResponse = await fetch(`${API_BASE_URL}/api/donations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        campaignId,
        amount: 25,
        donorName: 'Test Donor',
        donorEmail: 'test@example.com',
        donorPhone: '',
        message: 'Test donation',
        isAnonymous: false,
        paymentIntentId,
      }),
    });

    const donationData = await donationResponse.json();
    console.log('Donation response:', donationData);

    if (donationData.success) {
      console.log('✅ Donation created successfully!');
    } else {
      console.log('❌ Donation creation failed:', donationData.message);
    }

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testDonationFlow();
