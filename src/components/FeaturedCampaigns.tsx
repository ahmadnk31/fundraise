import { useState, useEffect } from "react";
import { CampaignCard } from "./CampaignCard";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import ApiService from "@/services/api.service";
import { Campaign } from "@/types";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  raised: number;
  goal: number;
  daysLeft: number;
  donorCount: number;
  category: string;
  trending?: boolean;
}

export function FeaturedCampaigns() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<CampaignCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeaturedCampaigns = async () => {
      try {
        setLoading(true);
        const response = await ApiService.getCampaigns({ 
          featured: true, 
          limit: 6 
        });
        
        // Transform the API response to match the CampaignCard props
        const transformedCampaigns = response.data.campaigns.map((campaign: Campaign) => {
          const deadline = new Date(campaign.deadline || Date.now() + 30 * 24 * 60 * 60 * 1000);
          const today = new Date();
          const timeDiff = deadline.getTime() - today.getTime();
          const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
          
          return {
            id: campaign.id,
            title: campaign.title,
            description: campaign.summary,
            image: campaign.coverImage || '/placeholder.svg',
            raised: parseFloat(campaign.currentAmount),
            goal: parseFloat(campaign.goalAmount),
            daysLeft,
            donorCount: 0, // Will be populated if we add stats endpoint later
            category: campaign.category,
            trending: campaign.isFeatured
          };
        });
        
        setCampaigns(transformedCampaigns);
      } catch (err) {
        console.error('Error fetching featured campaigns:', err);
        setError('Failed to load featured campaigns');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedCampaigns();
  }, []);

  const handleViewAllCampaigns = () => {
    navigate('/campaigns');
  };

  if (loading) {
    return (
      <section id="campaigns" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Campaigns</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Discover inspiring stories and make a difference in someone's life today.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-muted animate-pulse rounded-lg h-96"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="campaigns" className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Featured Campaigns</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="campaigns" className="py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Campaigns</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Discover inspiring stories and make a difference in someone's life today.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} {...campaign} />
          ))}
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="ghost" 
            className="text-primary hover:text-primary-glow font-medium text-lg"
            onClick={handleViewAllCampaigns}
          >
            View All Campaigns →
          </Button>
        </div>
      </div>
    </section>
  );
}