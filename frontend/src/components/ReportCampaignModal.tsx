import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Flag, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import ApiService from '@/services/api.service';

interface ReportCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  campaignId: string;
  campaignTitle: string;
}

const reportReasons = [
  { value: 'spam', label: 'Spam or misleading', description: 'False information or promotional content' },
  { value: 'inappropriate', label: 'Inappropriate content', description: 'Content that violates community guidelines' },
  { value: 'fraud', label: 'Fraudulent activity', description: 'Suspected scam or fraudulent campaign' },
  { value: 'offensive', label: 'Offensive content', description: 'Hateful, violent, or discriminatory content' },
  { value: 'copyright', label: 'Copyright violation', description: 'Unauthorized use of copyrighted material' },
  { value: 'other', label: 'Other', description: 'Another reason not listed above' },
] as const;

export const ReportCampaignModal: React.FC<ReportCampaignModalProps> = ({
  isOpen,
  onClose,
  campaignId,
  campaignTitle,
}) => {
  const { toast } = useToast();
  const [selectedReason, setSelectedReason] = useState<string>('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedReason || !description.trim()) {
      setError('Please select a reason and provide details');
      return;
    }

    if (description.length < 10) {
      setError('Please provide more details (minimum 10 characters)');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await ApiService.reportCampaign({
        campaignId,
        reason: selectedReason as any,
        description: description.trim(),
      });

      setSubmitted(true);
      toast({
        title: "Report submitted",
        description: "Thank you for helping keep our community safe. We'll review this report.",
      });
    } catch (err: any) {
      setError(err.message || 'Failed to submit report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedReason('');
    setDescription('');
    setError(null);
    setSubmitted(false);
    onClose();
  };

  if (submitted) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Report Submitted
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="text-center">
              <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Thank you for your report</h3>
              <p className="text-muted-foreground text-sm">
                We take reports seriously and will review this campaign thoroughly. 
                If we find violations, we'll take appropriate action.
              </p>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <p className="text-sm text-blue-800">
                <strong>What happens next?</strong> Our team will review the report within 24-48 hours. 
                If needed, we may reach out for additional information.
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleClose}>
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-red-600" />
            Report Campaign
          </DialogTitle>
          <DialogDescription>
            Report "{campaignTitle}" for violating our community guidelines.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Why are you reporting this campaign?</Label>
              <RadioGroup 
                value={selectedReason} 
                onValueChange={setSelectedReason}
                className="mt-3"
              >
                {reportReasons.map((reason) => (
                  <div key={reason.value} className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value={reason.value} id={reason.value} />
                      <Label htmlFor={reason.value} className="cursor-pointer">
                        {reason.label}
                      </Label>
                    </div>
                    <p className="text-sm text-muted-foreground ml-6">
                      {reason.description}
                    </p>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <Label htmlFor="description" className="text-base font-medium">
                Please provide additional details
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the issue in detail. This helps our team understand your concern better."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-2 min-h-[100px]"
                maxLength={500}
              />
              <div className="text-right text-sm text-muted-foreground mt-1">
                {description.length}/500 characters
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-800 mb-1">Before reporting:</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Make sure the campaign actually violates our guidelines</li>
                  <li>• Consider contacting the campaign organizer directly first</li>
                  <li>• False reports may result in account restrictions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedReason || !description.trim()}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <Flag className="mr-2 h-4 w-4" />
                  Submit Report
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
