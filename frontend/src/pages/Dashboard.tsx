import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import ApiService from "@/services/api.service";
import { Campaign, Donation, DashboardData } from "@/types";
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
  Loader2
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
  const [activeTab, setActiveTab] = useState("campaigns");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dashboard data state
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userCampaigns, setUserCampaigns] = useState<CampaignWithStats[]>([]);
  const [userDonations, setUserDonations] = useState<Donation[]>([]);
  const [savedCampaigns, setSavedCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch all dashboard data in parallel
        const [dashboardResponse, campaignsResponse, donationsResponse] = await Promise.all([
          ApiService.getDashboard(),
          ApiService.getUserCampaigns({ limit: 10 }),
          ApiService.getUserDonations({ limit: 10 })
        ]);

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
        
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, navigate]);

  const handleCreateCampaign = () => {
    navigate('/create-campaign');
  };

  const handleViewCampaign = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  const handleEditCampaign = (campaignId: string) => {
    // TODO: Create edit campaign page
    navigate(`/campaign/${campaignId}/edit`);
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
                                  onClick={() => handleViewCampaign(campaign.id)}
                                >
                                  <Eye className="w-4 h-4 mr-2" />
                                  View
                                </Button>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => handleEditCampaign(campaign.id)}
                                >
                                  <Edit className="w-4 h-4 mr-2" />
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
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

            <TabsContent value="saved" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Saved Campaigns
                  </CardTitle>
                </CardHeader>
                <CardContent>
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