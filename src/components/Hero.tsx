import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Users, DollarSign, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Hero() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const handleStartCampaign = () => {
    if (isAuthenticated) {
      navigate('/create-campaign');
    } else {
      navigate('/register');
    }
  };

  const handleExploreCampaigns = () => {
    // Scroll to campaigns section or navigate to campaigns page
    const campaignsSection = document.getElementById('campaigns');
    if (campaignsSection) {
      campaignsSection.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/campaigns');
    }
  };

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const query = formData.get('search') as string;
    if (query.trim()) {
      navigate(`/campaigns?search=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <section className="relative py-20 px-4 bg-gradient-hero">
      <div className="container mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Main Heading */}
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Turn Your Dreams Into
              <span className="bg-gradient-primary bg-clip-text text-transparent"> Reality</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join millions who are making a difference. Start your campaign today and watch your community rally behind your cause.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-gradient-primary hover:opacity-90 text-lg px-8 py-3"
              onClick={handleStartCampaign}
            >
              Start Your Campaign
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-3"
              onClick={handleExploreCampaigns}
            >
              Explore Campaigns
            </Button>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              name="search"
              placeholder="Search for causes you care about..."
              className="pl-12 py-3 text-lg bg-background/80 backdrop-blur"
            />
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 pt-16 border-t border-border/20">
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <DollarSign className="w-6 h-6" />
                <span className="text-3xl font-bold">$2.5B+</span>
              </div>
              <p className="text-muted-foreground">Raised for causes</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Users className="w-6 h-6" />
                <span className="text-3xl font-bold">15M+</span>
              </div>
              <p className="text-muted-foreground">People helped</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-primary">
                <Trophy className="w-6 h-6" />
                <span className="text-3xl font-bold">500K+</span>
              </div>
              <p className="text-muted-foreground">Successful campaigns</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}