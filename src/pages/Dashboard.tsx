import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { StripeConnectCard } from "@/components/StripeConnectCard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ApiService from "@/services/api.service";
import { Campaign, Donation, DashboardData, Payout, CampaignBalance } from "@/types";
import { 
  Plus, 
  Eye, 
  Edit, 
  Share2, 
  BarChart3, 
  Heart, 
  DollarSign,
  Users,
  Calendar,
  TrendingUp,
  Loader2,
  Wallet,
  CreditCard,
  AlertCircle,
  CheckCircle,
  Info as InfoIcon
} from "lucide-react";

interface CampaignWithStats extends Campaign {
  donors?: number;
  daysLeft?: number;
  views?: number;
  shares?: number;
}

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabFromUrl || "campaigns");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<CampaignWithStats[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);
  const [userPayouts, setUserPayouts] = useState<Payout[]>([]);
  const [campaignBalances, setCampaignBalances] = useState<Record<string, CampaignBalance>>({});

  useEffect(() => {
    if (tabFromUrl && ["campaigns", "donations", "payouts", "saved"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch core dashboard data first
        console.log('Fetching dashboard data...');
        const [dashboardResponse, campaignsResponse, donationsResponse] = await Promise.all([
          ApiService.getDashboard(),
          ApiService.getUserCampaigns({ limit: 10 }),
          ApiService.getUserDonations({ limit: 10 })
        ]);

        console.log('Core data fetched successfully');
        setDashboardData(dashboardResponse.data!);
        
        // Transform campaigns with additional stats
        const campaignsWithStats = campaignsResponse.data.campaigns.map((campaign: Campaign) => {
          const deadline = new Date(campaign.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000);
          const today = new Date();
          const timeDiff = deadline.getTime() - today.getTime();
          const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
          
          return {
            ...campaign,
            daysLeft,
            donors: 0, // TODO: Add to API response if needed
            views: 0, // TODO: Add to API response if needed
            shares: 0 // TODO: Add to API response if needed
          };
        });
        
        setUserCampaigns(campaignsWithStats);
        setUserDonations(donationsResponse.data.donations);

        // Fetch payout data only if user has campaigns
        if (campaignsWithStats.length > 0) {
          console.log('Fetching payout data for', campaignsWithStats.length, 'campaigns...');
          try {
            const payoutsResponse = await ApiService.getUserPayouts({ limit: 10 });
            setUserPayouts(payoutsResponse.data.payouts || []);
            console.log('Payout data fetched successfully');

            // Fetch campaign balances for each campaign
            console.log('Fetching campaign balances...');
            const balances: Record<string, CampaignBalance> = {};
            for (const campaign of campaignsWithStats) {
              try {
                const balanceResponse = await ApiService.getCampaignBalance(campaign.id);
                if (balanceResponse.success && balanceResponse.data) {
                  balances[campaign.id] = balanceResponse.data;
                }
              } catch (error) {
                console.warn(`Failed to fetch balance for campaign ${campaign.id}:`, error);
              }
            }
            setCampaignBalances(balances);
            console.log('Campaign balances fetched successfully');
          } catch (error) {
            console.warn('Failed to fetch payout data:', error);
            // Set empty payout data instead of failing completely
            setUserPayouts([]);
            setCampaignBalances({});
          }
        } else {
          console.log('No campaigns found, skipping payout data fetch');
        }

        // Fetch followed campaigns
        try {
          console.log('Fetching followed campaigns...');
          const followedResponse = await ApiService.getUserFollowedCampaigns({ limit: 10 });
          if (followedResponse.success && followedResponse.data?.followedCampaigns) {
            const followedCampaigns = followedResponse.data.followedCampaigns.map((follow: any) => follow.campaign).filter(Boolean);
            setSavedCampaigns(followedCampaigns);
            console.log('Followed campaigns fetched successfully:', followedCampaigns.length);
          }
        } catch (error) {
          console.warn('Failed to fetch followed campaigns:', error);
          setSavedCampaigns([]);
        }
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(`Failed to load dashboard data: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleViewCampaign = (campaign: CampaignWithStats) => {
    // Use the slug if available, otherwise use the ID
    const identifier = campaign.slug || campaign.id;
    navigate(`/campaign/${identifier}`);
  };

  const handleEditCampaign = (campaign: CampaignWithStats) => {
    const identifier = campaign.slug || campaign.id;
    navigate(`/campaign/${identifier}/edit`);
  };

  const handleShareCampaign = (campaign: CampaignWithStats) => {
    const identifier = campaign.slug || campaign.id;
    const url = `${window.location.origin}/campaign/${identifier}`;
    
    // Try to use the Web Share API if available (mobile devices)
    if (navigator.share) {
      navigator.share({
        title: campaign.title,
        text: campaign.summary,
        url: url,
      }).catch(err => {
        console.log('Error sharing:', err);
        // Fallback to copying to clipboard
        copyToClipboard(url, campaign.title);
      });
    } else {
      // Fallback to copying to clipboard
      copyToClipboard(url, campaign.title);
    }
  };

  const copyToClipboard = (url: string, title: string) => {
    navigator.clipboard.writeText(url).then(() => {
      alert(`Campaign link copied to clipboard!\n\n"${title}"\n${url}`);
    }).catch(err => {
      console.error('Failed to copy to clipboard:', err);
      // Final fallback - show the URL in an alert
      alert(`Share this campaign:\n\n"${title}"\n${url}`);
    });
  };

  const handleRequestPayout = async (campaignId: string) => {
    const campaign = userCampaigns.find(c => c.id === campaignId);
    const balance = campaignBalances[campaignId];
    
    if (!campaign || !balance) {
      alert('Campaign or balance information not found');
      return;
    }

    if (!balance.canPayout) {
      alert(`Minimum payout amount is $${balance.minimumPayoutAmount}`);
      return;
    }

    try {
      const response = await ApiService.requestPayout({ campaignId });
      
      if (response.success) {
        alert('Payout requested successfully! Your funds will be transferred automatically via Stripe Connect.');
        // Refresh the dashboard data
        window.location.reload();
      } else {
        throw new Error(response.message || 'Failed to request payout');
      }
    } catch (error: any) {
      console.error('Payout request error:', error);
      
      let errorMessage = error.message || 'Unknown error';
      
      // Show more helpful message for test environment
      if (errorMessage.includes('Test Environment') || errorMessage.includes('insufficient available funds')) {
        alert(`⚠️ Test Environment Notice:\n\n${errorMessage}\n\nℹ️ In production, this would work automatically with real donations funding the platform account.`);
      } else {
        alert(`Failed to request payout: ${errorMessage}`);
      }
    }
  };

  const handleExploreCampaigns = () => {
    navigate('/campaigns');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Error Loading Dashboard</h2>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
              <p className="text-muted-foreground">
                Manage your campaigns and track your impact
              </p>
            </div>
            <Button 
              className="bg-gradient-primary hover:opacity-90 mt-4 md:mt-0"
              onClick={handleCreateCampaign}
            >
              <Plus className="w-4 h-4 mr-2" />
              Start New Campaign
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Raised</p>
                    <p className="text-2xl font-bold text-primary">
                      ${(dashboardData?.campaigns?.totalRaised || 0).toLocaleString()}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Donated</p>
                    <p className="text-2xl font-bold text-primary">
                      ${(dashboardData?.donations?.totalAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <Heart className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Campaigns</p>
                    <p className="text-2xl font-bold text-primary">
                      {dashboardData?.campaigns?.active || 0}
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Campaigns</p>
                    <p className="text-2xl font-bold text-success">
                      {dashboardData?.campaigns?.total || 0}
                    </p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="campaigns">My Campaigns</TabsTrigger>
              <TabsTrigger value="donations">My Donations</TabsTrigger>
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
              <TabsTrigger value="saved">Saved Campaigns</TabsTrigger>
            </TabsList>

            <TabsContent value="campaigns" className="space-y-6">
              {userCampaigns.length === 0 ? (
                <Card>
                  <CardContent className="text-center py-12">
                    <TrendingUp className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No campaigns yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your first campaign and make a difference
                    </p>
                    <Button className="bg-gradient-primary hover:opacity-90" onClick={handleCreateCampaign}>
                      Create Your First Campaign
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                userCampaigns.map((campaign) => {
                  const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
                  
                  return (
                    <Card key={campaign.id} className="overflow-hidden">
                      <CardContent className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Campaign Image */}
                          <div className="w-full lg:w-48 h-32 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center overflow-hidden">
                            {campaign.coverImage ? (
                              <img 
                                src={campaign.coverImage} 
                                alt={campaign.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="text-4xl opacity-30">🎯</div>
                            )}
                          </div>

                          {/* Campaign Details */}
                          <div className="flex-1 space-y-4">
                            <div className="flex flex-col md:flex-row justify-between items-start">
                              <div>
                                <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                                <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                                  {campaign.isActive ? 'Active' : 'Inactive'}
                                </Badge>
                                {campaign.isApproved && (
                                  <Badge variant="outline" className="ml-2">
                                    Approved
                                  </Badge>
                                )}
                                {campaign.isFeatured && (
                                  <Badge variant="default" className="ml-2 bg-gradient-primary">
                                    Featured
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex gap-2 mt-4 md:mt-0">
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleViewCampaign(campaign)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditCampaign(campaign)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleShareCampaign(campaign)}
                                >
                                  <Share2 className="w-4 h-4 mr-2" />
                                  Share
                                </Button>
                                {campaignBalances[campaign.id]?.canPayout && (
                                  <Button 
                                    variant="default" 
                                    size="sm"
                                    className="bg-gradient-primary hover:opacity-90"
                                    onClick={() => handleRequestPayout(campaign.id)}
                                  >
                                    <Wallet className="w-4 h-4 mr-2" />
                                    Request Payout
                                  </Button>
                                )}
                              </div>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium text-primary">
                                  ${parseFloat(campaign.currentAmount).toLocaleString()} raised
                                </span>
                                <span className="text-muted-foreground">
                                  of ${parseFloat(campaign.goalAmount).toLocaleString()}
                                </span>
                              </div>
                              <Progress value={progress} className="h-2" />
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-muted-foreground">Category:</span>
                                <span className="font-medium ml-1">{campaign.category}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Progress:</span>
                                <span className="font-medium ml-1">{progress.toFixed(1)}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Currency:</span>
                                <span className="font-medium ml-1">{campaign.currency}</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Days left:</span>
                                <span className="font-medium ml-1">
                                  {campaign.daysLeft !== undefined ? (campaign.daysLeft > 0 ? campaign.daysLeft : 'Ended') : 'N/A'}
                                </span>
                              </div>
                            </div>

                            {/* Balance Information */}
                            {campaignBalances[campaign.id] && (
                              <div className="mt-4 p-3 bg-muted/30 rounded-lg">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                  <div>
                                    <span className="text-muted-foreground">Available:</span>
                                    <span className="font-medium ml-1 text-green-600">
                                      ${campaignBalances[campaign.id].availableBalance.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Paid Out:</span>
                                    <span className="font-medium ml-1">
                                      ${campaignBalances[campaign.id].paidOut.toLocaleString()}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-muted-foreground">Status:</span>
                                    <span className={`font-medium ml-1 ${campaignBalances[campaign.id].canPayout ? 'text-green-600' : 'text-orange-600'}`}>
                                      {campaignBalances[campaign.id].canPayout ? 'Ready for payout' : 'Below minimum'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>

            <TabsContent value="donations" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Your Donation History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userDonations.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start supporting campaigns that matter to you
                      </p>
                      <Button className="bg-gradient-primary hover:opacity-90" onClick={handleExploreCampaigns}>
                        Explore Campaigns
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {userDonations.map((donation, index) => (
                          <div key={donation.id || index} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{donation.campaign.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {donation.isAnonymous ? 'Anonymous donation' : 'Public donation'} • {new Date(donation.createdAt).toLocaleDateString()}
                              </p>
                              {donation.message && (
                                <p className="text-sm text-muted-foreground italic mt-1">
                                  "{donation.message}"
                                </p>
                              )}
                            </div>
                            <div className="text-right">
                              <span className="text-lg font-semibold text-primary">
                                ${parseFloat(donation.amount).toLocaleString()}
                              </span>
                              <p className="text-xs text-muted-foreground">
                                {donation.status}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
                        <div className="flex justify-between items-center">
                          <span className="font-semibold">Total Donated:</span>
                          <span className="text-xl font-bold text-primary">
                            ${(dashboardData?.donations?.totalAmount || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="payouts" className="space-y-6">
              {/* Development Notice */}
              <Alert className="border-blue-200 bg-blue-50">
                <InfoIcon className="h-4 w-4" />
                <AlertDescription className="text-blue-800">
                  <strong>Automatic Payout System:</strong> All payouts are processed automatically through Stripe Connect. 
                  You must complete your Stripe Connect onboarding to receive payouts.
                </AlertDescription>
              </Alert>

              {/* Test Environment Notice */}
              <Alert className="border-orange-200 bg-orange-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-orange-800">
                  <strong>Test Environment:</strong> In test mode, the platform account needs funds before transfers can be made. 
                  In production, donations would automatically fund the platform account. 
                  <br /><br />
                  <strong>To test payouts:</strong>
                  <br />• Make a test donation to your campaign first (this adds funds to the platform account)
                  <br />• Or use the Stripe test card 4000000000000077 to add funds directly to your platform account
                </AlertDescription>
              </Alert>

              {/* Stripe Connect Setup for Each Campaign */}
              { userCampaigns.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Setup</h3>
                  {userCampaigns.map((campaign) => (
                    <StripeConnectCard
                      key={campaign.id}
                      campaignId={campaign.id}
                      campaignTitle={campaign.title}
                    />
                  ))}
                </div>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-5 h-5 text-primary" />
                    Payout History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {userPayouts.length === 0 ? (
                    <div className="text-center py-12">
                      <Wallet className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No payouts yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Request payouts for your campaigns to see them here
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {userPayouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-4 border rounded-lg">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{payout.campaign?.title || 'Campaign'}</h4>
                              <Badge 
                                variant={
                                  payout.status === 'completed' ? 'default' : 
                                  payout.status === 'failed' ? 'destructive' : 
                                  payout.status === 'processing' ? 'secondary' : 'outline'
                                }
                                className={
                                  payout.status === 'completed' ? 'bg-green-100 text-green-800 border-green-200' :
                                  payout.status === 'processing' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  undefined
                                }
                              >
                                {payout.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                {payout.status === 'failed' && <AlertCircle className="w-3 h-3 mr-1" />}
                                {payout.status}
                              </Badge>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                              <div>
                                <span>Requested:</span>
                                <span className="ml-1">{new Date(payout.requestedAt).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span>Method:</span>
                                <span className="ml-1 capitalize">{payout.paymentMethod.replace('_', ' ')}</span>
                              </div>
                              <div>
                                <span>Platform Fee:</span>
                                <span className="ml-1">${parseFloat(payout.platformFee).toLocaleString()}</span>
                              </div>
                              <div>
                                <span>Processing Fee:</span>
                                <span className="ml-1">${parseFloat(payout.processingFee).toLocaleString()}</span>
                              </div>
                            </div>
                            {payout.failureReason && (
                              <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                                <strong>Failure reason:</strong> {payout.failureReason}
                              </div>
                            )}
                          </div>
                          <div className="text-right ml-4">
                            <div className="text-lg font-semibold text-primary">
                              ${parseFloat(payout.netAmount).toLocaleString()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              of ${parseFloat(payout.amount).toLocaleString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Campaign Balances Summary */}
              {Object.keys(campaignBalances).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-primary" />
                      Campaign Balances
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userCampaigns.map((campaign) => {
                        const balance = campaignBalances[campaign.id];
                        if (!balance) return null;
                        
                        return (
                          <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                            <div>
                              <h4 className="font-medium">{campaign.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                Total raised: ${balance.totalRaised.toLocaleString()} • 
                                Paid out: ${balance.paidOut.toLocaleString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold text-green-600">
                                ${balance.availableBalance.toLocaleString()}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Available
                              </div>
                              {balance.canPayout ? (
                                <Button 
                                  size="sm" 
                                  className="mt-2 bg-gradient-primary hover:opacity-90"
                                  onClick={() => handleRequestPayout(campaign.id)}
                                >
                                  <Wallet className="w-3 h-3 mr-1" />
                                  Request Payout
                                </Button>
                              ) : (
                                <div className="text-xs text-orange-600 mt-1">
                                  Min: ${balance.minimumPayoutAmount}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Saved Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {savedCampaigns.length === 0 ? (
                    <div className="text-center py-12">
                      <Heart className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No saved campaigns yet</h3>
                      <p className="text-muted-foreground mb-4">
                        Start exploring campaigns and save the ones you care about
                      </p>
                      <Button 
                        className="bg-gradient-primary hover:opacity-90"
                        onClick={handleExploreCampaigns}
                      >
                        Explore Campaigns
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {savedCampaigns.map((campaign) => {
                        const progress = (parseFloat(campaign.currentAmount) / parseFloat(campaign.goalAmount)) * 100;
                        
                        return (
                          <Card key={campaign.id} className="overflow-hidden">
                            <CardContent className="p-6">
                              <div className="flex flex-col lg:flex-row gap-6">
                                {/* Campaign Image */}
                                <div className="w-full lg:w-48 h-32 bg-gradient-to-r from-primary/20 to-primary-glow/20 rounded-lg flex items-center justify-center overflow-hidden">
                                  {campaign.coverImage ? (
                                    <img 
                                      src={campaign.coverImage} 
                                      alt={campaign.title}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="text-4xl opacity-30">🎯</div>
                                  )}
                                </div>

                                {/* Campaign Details */}
                                <div className="flex-1 space-y-4">
                                  <div className="flex flex-col md:flex-row justify-between items-start">
                                    <div>
                                      <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                                      <p className="text-muted-foreground line-clamp-2">{campaign.summary}</p>
                                      <div className="flex gap-2 mt-2">
                                        <Badge variant={campaign.isActive ? 'default' : 'secondary'}>
                                          {campaign.isActive ? 'Active' : 'Inactive'}
                                        </Badge>
                                        <Badge variant="outline">{campaign.category}</Badge>
                                      </div>
                                    </div>
                                    
                                    <div className="flex gap-2 mt-4 md:mt-0">
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleViewCampaign(campaign)}
                                      >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => handleShareCampaign(campaign)}
                                      >
                                        <Share2 className="w-4 h-4 mr-2" />
                                        Share
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Progress */}
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="font-medium text-primary">
                                        ${parseFloat(campaign.currentAmount).toLocaleString()} raised
                                      </span>
                                      <span className="text-muted-foreground">
                                        of ${parseFloat(campaign.goalAmount).toLocaleString()}
                                      </span>
                                    </div>
                                    <Progress value={progress} className="h-2" />
                                  </div>

                                  {/* Stats */}
                                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Progress:</span>
                                      <span className="font-medium ml-1">{progress.toFixed(1)}%</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Creator:</span>
                                      <span className="font-medium ml-1">{campaign.user.firstName} {campaign.user.lastName}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Location:</span>
                                      <span className="font-medium ml-1">{campaign.location || 'Not specified'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Dashboard;