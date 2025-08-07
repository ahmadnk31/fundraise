import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { DonateForm } from "@/components/DonateForm";
import { CommentsSection } from "@/components/CommentsSection";
import { FollowButton } from "@/components/FollowButton";
import { ReportCampaignModal } from "@/components/ReportCampaignModal";
import { useToast } from "@/hooks/use-toast";
import ApiService from "@/services/api.service";
import { CampaignDetail as CampaignDetailType, Donation } from "@/types";
import { 
  Heart, 
  Share2, 
  Flag, 
  Calendar, 
  MapPin, 
  Users, 
  TrendingUp,
  DollarSign,
  Clock,
  Loader2,
  ArrowLeft
} from "lucide-react";

const CampaignDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [campaign, setCampaign] = useState<CampaignDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [donateModalOpen, setDonateModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  const fetchCampaignData = async () => {
    if (!id) {
      navigate('/campaigns');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.getCampaign(id);
      
      // The backend returns { campaign, recentDonations, stats }
      // We need to merge campaign with stats for the CampaignDetail type
      const campaignDetail: CampaignDetailType = {
        ...response.data.campaign,
        recentDonations: response.data.recentDonations,
        stats: response.data.stats,
      };
      
      setCampaign(campaignDetail);
    } catch (err) {
      console.error('Error fetching campaign:', err);
      setError('Failed to load campaign details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaignData();
  }, [id, navigate]);

  // Check for donate query parameter
  useEffect(() => {
    if (searchParams.get('donate') === 'true' && campaign) {
      setDonateModalOpen(true);
      // Clean up URL by removing the query parameter
      searchParams.delete('donate');
      setSearchParams(searchParams, { replace: true });
    }
  }, [campaign, searchParams, setSearchParams]);

  const handleBack = () => {
    navigate('/campaigns');
  };

  const handleDonate = () => {
    setDonateModalOpen(true);
  };

  const handleShare = () => {
    if (navigator.share && campaign) {
      navigator.share({
        title: campaign.title,
        text: campaign.summary,
        url: window.location.href,
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReport = () => {
    setReportModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading campaign details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Campaign Not Found</h2>
            <p className="text-muted-foreground mb-4">{error || 'The campaign you are looking for does not exist.'}</p>
            <Button onClick={handleBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Campaigns
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const currentAmount = parseFloat(campaign.currentAmount || '0');
  const goalAmount = parseFloat(campaign.goalAmount || '1');
  const progress = goalAmount > 0 ? (currentAmount / goalAmount) * 100 : 0;
  const deadline = new Date(campaign.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000);
  const today = new Date();
  const timeDiff = deadline.getTime() - today.getTime();
  const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
  
  // Determine if campaign is effectively ended
  const isEnded = !campaign.isActive || (campaign.deadline && deadline <= today);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button 
          variant="ghost" 
          onClick={handleBack}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Campaigns
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Campaign Image */}
            <div className="relative aspect-video bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg overflow-hidden">
              {campaign.coverImage ? (
                <img 
                  src={campaign.coverImage} 
                  alt={campaign.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-8xl opacity-30">❤️</div>
                </div>
              )}
              {campaign.isFeatured && (
                <Badge className="absolute top-4 left-4 bg-warning text-warning-foreground">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Featured
                </Badge>
              )}
              <Badge className="absolute top-4 right-4 bg-background/90 text-foreground">
                {campaign.category}
              </Badge>
            </div>

            {/* Campaign Info */}
            <div className="space-y-4">
              <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                {campaign.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                {campaign.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {campaign.location}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4" />
                  {campaign.stats?.totalDonors || 0} supporters
                </div>
                {!isEnded && daysLeft > 0 && (
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {daysLeft} days left
                  </div>
                )}
                {isEnded && (
                  <div className="flex items-center gap-1 text-red-600">
                    <Clock className="w-4 h-4" />
                    Campaign ended
                  </div>
                )}
              </div>

              {/* Summary */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                {campaign.summary}
              </p>
            </div>

            {/* Story */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Story</CardTitle>
              </CardHeader>
              <CardContent className="prose prose-gray max-w-none">
                <div 
                  className="text-foreground leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: (campaign.story || '').replace(/\n/g, '<br>') }}
                />
              </CardContent>
            </Card>

            {/* Budget Breakdown */}
            {campaign.budgetBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Budget Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div 
                    className="text-foreground leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: (campaign.budgetBreakdown || '').replace(/\n/g, '<br>') }}
                  />
                </CardContent>
              </Card>
            )}

            {/* Organizer */}
            <Card>
              <CardHeader>
                <CardTitle>Campaign Organizer</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    {campaign.user?.avatar ? (
                      <img src={campaign.user.avatar} alt={`${campaign.user.firstName} ${campaign.user.lastName}`} />
                    ) : (
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        {(campaign.user?.firstName || 'U').charAt(0)}{(campaign.user?.lastName || 'N').charAt(0)}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-semibold">{campaign.user?.firstName || 'Unknown'} {campaign.user?.lastName || 'User'}</h3>
                    <p className="text-sm text-muted-foreground">Campaign organizer</p>
                    {campaign.location && (
                      <p className="text-sm text-muted-foreground mt-1">
                        Organizer in {campaign.location}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Updates */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.recentDonations && campaign.recentDonations.length > 0 ? (
                  campaign.recentDonations.slice(0, 3).map((donation, index) => (
                    <div key={donation.id} className="border-l-2 border-primary pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-semibold">
                          {donation.isAnonymous ? 'Anonymous' : (donation.donorName || 'Anonymous')} donated
                        </h4>
                        <span className="text-sm text-muted-foreground">
                          {new Date(donation.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-muted-foreground">
                        Donated ${parseFloat(donation.amount).toLocaleString()} to support this campaign.
                        {donation.message && (
                          <span className="italic"> "{donation.message}"</span>
                        )}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No recent activity yet.</p>
                  </div>
                )}
              </CardContent>
            </Card>
            {/* Comments Section */}
            <CommentsSection campaignId={campaign.id} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Card */}
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-primary">
                      ${parseFloat(campaign.currentAmount).toLocaleString()}
                    </span>
                    <span className="text-muted-foreground">
                      of ${parseFloat(campaign.goalAmount).toLocaleString()}
                    </span>
                  </div>
                  
                  <Progress value={progress} className="h-3" />
                  
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold">{campaign.stats.totalDonors}</div>
                      <div className="text-sm text-muted-foreground">Donors</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold">
                        {isEnded ? 0 : daysLeft}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {isEnded ? 'Ended' : 'Days left'}
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Button 
                    className="w-full bg-gradient-primary hover:opacity-90 text-lg py-3"
                    onClick={handleDonate}
                    disabled={isEnded}
                  >
                    <DollarSign className="w-5 h-5 mr-2" />
                    {isEnded ? 'Campaign Ended' : 'Donate Now'}
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <FollowButton
                      campaignId={campaign.id}
                      onFollowChange={(isFollowing, count) => {
                        // Optional: update local state or show feedback
                        console.log(`Follow status changed: ${isFollowing}, count: ${count}`);
                      }}
                    />
                    <Button variant="outline" className="flex-1" onClick={handleShare}>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share
                    </Button>
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="w-full text-muted-foreground"
                    onClick={handleReport}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Report campaign
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-primary" />
                  Recent Donations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {campaign.recentDonations && campaign.recentDonations.length > 0 ? (
                  <>
                    {campaign.recentDonations.map((donation, index) => (
                      <div key={donation.id} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="text-xs bg-primary/10">
                                {donation.isAnonymous || !donation.donorName 
                                  ? 'A' 
                                  : donation.donorName.charAt(0)
                                }
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium text-sm">
                                {donation.isAnonymous ? 'Anonymous' : (donation.donorName || 'Anonymous')}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {new Date(donation.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          <span className="font-semibold text-primary">
                            ${parseFloat(donation.amount).toLocaleString()}
                          </span>
                        </div>
                        {donation.message && (
                          <p className="text-sm text-muted-foreground italic pl-10">
                            "{donation.message}"
                          </p>
                        )}
                        {index < campaign.recentDonations.length - 1 && <Separator />}
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full mt-4">
                      View all donations
                    </Button>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Be the first to donate!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />

      {/* Donate Modal */}
      {campaign && (
        <DonateForm
          campaign={campaign}
          isOpen={donateModalOpen}
          onClose={() => setDonateModalOpen(false)}
          onSuccess={() => {
            // Refresh campaign data after successful donation
            fetchCampaignData();
            toast({
              title: "Thank you!",
              description: "Your donation has been received successfully.",
            });
          }}
        />
      )}

      {/* Report Campaign Modal */}
      {campaign && (
        <ReportCampaignModal
          isOpen={reportModalOpen}
          onClose={() => setReportModalOpen(false)}
          campaignId={campaign.id}
          campaignTitle={campaign.title}
        />
      )}
    </div>
  );
};

export default CampaignDetail;