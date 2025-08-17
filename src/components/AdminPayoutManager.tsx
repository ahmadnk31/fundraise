import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Clock, CheckCircle, XCircle, DollarSign, CreditCard, User, Calendar } from 'lucide-react';
import ApiService from '../services/api.service';

interface PendingPayout {
  id: string;
  amount: string;
  netAmount: string;
  platformFee: string;
  processingFee: string;
  currency: string;
  paymentMethod: string;
  requestedAt: string;
  campaign: {
    id: string;
    title: string;
    slug: string;
  };
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export function AdminPayoutManager() {
  const [pendingPayouts, setPendingPayouts] = useState<PendingPayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPayoutId, setProcessingPayoutId] = useState<string | null>(null);
  const [selectedPayout, setSelectedPayout] = useState<PendingPayout | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [processAction, setProcessAction] = useState<'approve' | 'reject' | 'process_stripe'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [stripeDestination, setStripeDestination] = useState('');

  useEffect(() => {
    fetchPendingPayouts();
  }, []);

  const fetchPendingPayouts = async () => {
    try {
      setLoading(true);
      console.log('Fetching pending payouts...');
      const response = await ApiService.getPendingPayouts();
      console.log('Pending payouts response:', response);
      if (response.success) {
        setPendingPayouts(response.data);
        console.log('Set pending payouts:', response.data);
      } else {
        console.error('Failed to fetch pending payouts:', response.message);
      }
    } catch (error) {
      console.error('Error fetching pending payouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!selectedPayout) return;

    try {
      setProcessingPayoutId(selectedPayout.id);
      
      const requestData: any = {
        action: processAction,
      };

      if (processAction === 'reject' && rejectionReason) {
        requestData.rejectionReason = rejectionReason;
      }

      if (processAction === 'process_stripe' && stripeDestination) {
        requestData.stripeTransferData = {
          destinationAccount: stripeDestination,
          transferAmount: parseFloat(selectedPayout.netAmount),
        };
      }

      const response = await ApiService.processAdminPayout(selectedPayout.id, requestData);
      
      if (response.success) {
        // Remove the processed payout from the list
        setPendingPayouts(prev => prev.filter(p => p.id !== selectedPayout.id));
        setShowProcessModal(false);
        setSelectedPayout(null);
        alert(`Payout ${processAction}d successfully!`);
      } else {
        alert(response.message || 'Failed to process payout');
      }
    } catch (error) {
      console.error('Error processing payout:', error);
      alert('Failed to process payout');
    } finally {
      setProcessingPayoutId(null);
    }
  };

  const openProcessModal = (payout: PendingPayout) => {
    setSelectedPayout(payout);
    setProcessAction('approve');
    setRejectionReason('');
    setStripeDestination('');
    setShowProcessModal(true);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading Pending Payouts...</CardTitle>
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Pending Manual Payouts
              </CardTitle>
              <CardDescription>
                Review and process manual payout requests from campaign creators
              </CardDescription>
            </div>
            <Button variant="outline" onClick={fetchPendingPayouts} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPayouts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Pending Payouts</h3>
              <p className="text-muted-foreground">
                All payout requests have been processed
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingPayouts.map((payout) => (
                <div key={payout.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h4 className="font-semibold">{payout.campaign.title}</h4>
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{payout.user.firstName} {payout.user.lastName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>{new Date(payout.requestedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span className="capitalize">{payout.paymentMethod.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Email:</span>
                          <span className="ml-1">{payout.user.email}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm bg-gray-50 p-2 rounded">
                        <div>
                          <span className="text-muted-foreground">Requested:</span>
                          <span className="ml-1 font-medium">${parseFloat(payout.amount).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Platform Fee:</span>
                          <span className="ml-1">${parseFloat(payout.platformFee).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Processing Fee:</span>
                          <span className="ml-1">${parseFloat(payout.processingFee).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Net Amount:</span>
                          <span className="ml-1 font-semibold text-green-600">${parseFloat(payout.netAmount).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4">
                      <Button 
                        onClick={() => openProcessModal(payout)}
                        disabled={processingPayoutId === payout.id}
                        size="sm"
                      >
                        {processingPayoutId === payout.id ? 'Processing...' : 'Process'}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Payout Modal */}
      <Dialog open={showProcessModal} onOpenChange={setShowProcessModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payout Request</DialogTitle>
            <DialogDescription>
              {selectedPayout && `${selectedPayout.campaign.title} - $${parseFloat(selectedPayout.netAmount).toLocaleString()}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="action">Action</Label>
              <Select value={processAction} onValueChange={(value: any) => setProcessAction(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="approve">Approve (Manual Processing)</SelectItem>
                  <SelectItem value="process_stripe">Process via Stripe</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {processAction === 'reject' && (
              <div>
                <Label htmlFor="reason">Rejection Reason</Label>
                <Textarea
                  id="reason"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this payout is being rejected..."
                  rows={3}
                />
              </div>
            )}

            {processAction === 'process_stripe' && (
              <div>
                <Label htmlFor="destination">Stripe Destination Account (Optional)</Label>
                <Input
                  id="destination"
                  value={stripeDestination}
                  onChange={(e) => setStripeDestination(e.target.value)}
                  placeholder="acct_1234567890 (leave empty for direct transfer)"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  If empty, will create a payment intent for direct bank transfer
                </p>
              </div>
            )}

            <Alert>
              <AlertDescription>
                {processAction === 'approve' && 'This will mark the payout as approved. You will need to process the payment manually outside of this system.'}
                {processAction === 'process_stripe' && 'This will attempt to process the payment via Stripe immediately.'}
                {processAction === 'reject' && 'This will reject the payout request and notify the user.'}
              </AlertDescription>
            </Alert>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowProcessModal(false)}>
                Cancel
              </Button>
              <Button 
                onClick={handleProcessPayout}
                disabled={processingPayoutId === selectedPayout?.id}
              >
                {processingPayoutId === selectedPayout?.id ? 'Processing...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
