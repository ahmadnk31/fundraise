import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { ExternalLink, CheckCircle, AlertCircle, Clock, CreditCard } from 'lucide-react';
import ApiService from '../services/api.service';
import { StripeConnectStatus } from '../types';

interface StripeConnectCardProps {
  campaignId: string;
  campaignTitle: string;
  onStatusChange?: (status: StripeConnectStatus) => void;
}

export function StripeConnectCard({ campaignId, campaignTitle, onStatusChange }: StripeConnectCardProps) {
  const [status, setStatus] = useState<StripeConnectStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchStatus();
  }, [campaignId]);

  const fetchStatus = async () => {
    try {
      setLoading(true);
      console.log('Fetching Stripe Connect status for campaign:', campaignId);
      const response = await ApiService.getStripeConnectStatus(campaignId);
      console.log('Stripe Connect status response:', response);
      if (response.success) {
        console.log('Stripe Connect status data:', response.data);
        setStatus(response.data);
        onStatusChange?.(response.data);
      } else {
        console.error('Failed to fetch Stripe Connect status:', response.message);
      }
    } catch (error) {
      console.error('Error fetching Stripe Connect status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async () => {
    try {
      setActionLoading(true);
      const response = await ApiService.createStripeConnectOnboarding(campaignId);
      if (response.success) {
        // Redirect to Stripe onboarding
        window.location.href = response.data.url;
      }
    } catch (error: any) {
      console.error('Error creating onboarding link:', error);
      
      // Handle specific Stripe Connect setup errors
      const errorData = error.response?.data;
      if (errorData?.code) {
        let alertMessage = 'Stripe Connect Setup Required\n\n';
        
        switch (errorData.code) {
          case 'STRIPE_CONNECT_NOT_ENABLED':
            alertMessage += 'Stripe Connect is not enabled for your account.\n\n';
            alertMessage += '1. Go to your Stripe Dashboard\n';
            alertMessage += '2. Enable Stripe Connect\n';
            alertMessage += '3. Return here to complete setup\n\n';
            alertMessage += `Setup URL: ${errorData.setupUrl}`;
            break;
          case 'STRIPE_PLATFORM_PROFILE_REQUIRED':
            alertMessage += 'Platform profile setup is required.\n\n';
            alertMessage += '1. Complete your platform profile in Stripe\n';
            alertMessage += '2. Configure liability settings\n';
            alertMessage += '3. Return here to complete setup\n\n';
            alertMessage += `Setup URL: ${errorData.setupUrl}`;
            break;
          case 'STRIPE_LIABILITY_SETUP_REQUIRED':
            alertMessage += 'Liability settings need to be configured.\n\n';
            alertMessage += '1. Review liability options in Stripe\n';
            alertMessage += '2. Configure loss management settings\n';
            alertMessage += '3. Return here to complete setup\n\n';
            alertMessage += `Setup URL: ${errorData.setupUrl}`;
            break;
          default:
            alertMessage += `${errorData.message}\n\n`;
            alertMessage += `Setup URL: ${errorData.setupUrl}`;
        }
        
        alert(alertMessage);
        if (errorData.setupUrl) {
          window.open(errorData.setupUrl, '_blank');
        }
      } else {
        alert('Failed to create onboarding link. Please try again or use manual payout instead.');
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleDashboard = async () => {
    try {
      setActionLoading(true);
      const response = await ApiService.createStripeConnectLogin(campaignId);
      if (response.success) {
        // Open Stripe dashboard in new tab
        window.open(response.data.url, '_blank');
      }
    } catch (error) {
      console.error('Error creating dashboard link:', error);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Setup
          </CardTitle>
          <CardDescription>Setting up payment processing...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!status) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Stripe Connect Setup
          </CardTitle>
          <CardDescription>Failed to load payment setup status</CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchStatus} variant="outline">
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    if (status.connected) {
      return (
        <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Connected
        </Badge>
      );
    }
    
    if (status.needsOnboarding) {
      return (
        <Badge variant="destructive">
          <AlertCircle className="h-3 w-3 mr-1" />
          Setup Required
        </Badge>
      );
    }
    
    return (
      <Badge variant="secondary">
        <Clock className="h-3 w-3 mr-1" />
        Pending
      </Badge>
    );
  };

  const getStatusMessage = () => {
    if (status.connected) {
      return `Your Stripe account is fully connected for "${campaignTitle}". You can receive payouts and manage your account.`;
    }
    
    if (status.needsOnboarding) {
      return `Complete your Stripe account setup for "${campaignTitle}" to start receiving payouts. Note: For development/testing, consider using manual payouts instead.`;
    }
    
    return `Your Stripe account setup for "${campaignTitle}" is in progress. Some features may be limited.`;
  };

  const getActionButton = () => {
    if (status.connected) {
      return (
        <Button 
          onClick={handleDashboard} 
          disabled={actionLoading}
          variant="outline"
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          {actionLoading ? 'Loading...' : 'Stripe Dashboard'}
        </Button>
      );
    }
    
    if (status.needsOnboarding) {
      return (
        <Button 
          onClick={handleOnboard} 
          disabled={actionLoading}
          className="flex items-center gap-2"
        >
          <ExternalLink className="h-4 w-4" />
          {actionLoading ? 'Loading...' : 'Complete Setup'}
        </Button>
      );
    }
    
    return (
      <Button 
        onClick={fetchStatus} 
        disabled={actionLoading}
        variant="outline"
      >
        {actionLoading ? 'Checking...' : 'Check Status'}
      </Button>
    );
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Stripe Connect Setup
            </CardTitle>
            <CardDescription>Payment processing for "{campaignTitle}"</CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className={status.connected ? 'border-green-200 bg-green-50' : 'border-orange-200 bg-orange-50'}>
          <AlertDescription>
            {getStatusMessage()}
          </AlertDescription>
        </Alert>

        {!status.connected && (
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-blue-800">
              <strong>Development Note:</strong> Stripe Connect requires platform profile setup. For testing, you can use the manual payout system which doesn't require Stripe Connect configuration.
            </AlertDescription>
          </Alert>
        )}

        {status.connected && status.accountId && (
          <div className="space-y-2 text-sm text-gray-600">
            <p><strong>Account ID:</strong> {status.accountId}</p>
            {status.country && <p><strong>Country:</strong> {status.country.toUpperCase()}</p>}
            {status.email && <p><strong>Email:</strong> {status.email}</p>}
            <div className="flex gap-4">
              <span className={`flex items-center gap-1 ${status.canReceivePayments ? 'text-green-600' : 'text-orange-600'}`}>
                {status.canReceivePayments ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                Payments: {status.canReceivePayments ? 'Enabled' : 'Pending'}
              </span>
              <span className={`flex items-center gap-1 ${status.canReceivePayouts ? 'text-green-600' : 'text-orange-600'}`}>
                {status.canReceivePayouts ? <CheckCircle className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                Payouts: {status.canReceivePayouts ? 'Enabled' : 'Pending'}
              </span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          {getActionButton()}
        </div>
      </CardContent>
    </Card>
  );
}
