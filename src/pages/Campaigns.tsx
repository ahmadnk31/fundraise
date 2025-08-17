import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Footer } from '../components/Footer';
import { CategoryFilter } from '../components/CategoryFilter';
import { CampaignCard } from '../components/CampaignCard';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from '../components/ui/dropdown-menu';
import { Badge } from '../components/ui/badge';
import { Search, Filter, ChevronDown, Star, X, Clock, Target, TrendingUp, SortAsc, Users } from 'lucide-react';
import ApiService from '../services/api.service';
import { Campaign } from '../types';

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

export const Campaigns: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') ?? '');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') ?? 'All');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') ?? 'recent');
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(searchParams.get('featured') === 'true');
  const [campaigns, setCampaigns] = useState<CampaignCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });

  const fetchCampaigns = async (page = 1, category?: string, search?: string, sort?: string, featuredOnly?: boolean) => {
    try {
      setLoading(true);
      
      const response = await ApiService.getCampaigns({
        page,
        limit: 12,
        category: category && category !== 'All' ? category : undefined,
        search,
        sortBy: sort as 'recent' | 'goal' | 'raised',
        featured: featuredOnly
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
      setPagination(response.data.pagination);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError('Failed to load campaigns');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryStats = async () => {
    try {
      const response = await ApiService.getCategoryStats();
      setCategoryCounts(response.data.categories);
    } catch (err) {
      console.error('Error fetching category stats:', err);
      // Don't set error state for category stats failure
    }
  };

  useEffect(() => {
    fetchCampaigns(1, selectedCategory, debouncedSearchQuery, sortBy, showFeaturedOnly);
    
    // Update URL parameters
    const newSearchParams = new URLSearchParams();
    if (selectedCategory !== 'All') {
      newSearchParams.set('category', selectedCategory);
    }
    if (debouncedSearchQuery) {
      newSearchParams.set('search', debouncedSearchQuery);
    }
    if (sortBy !== 'recent') {
      newSearchParams.set('sortBy', sortBy);
    }
    if (showFeaturedOnly) {
      newSearchParams.set('featured', 'true');
    }
    setSearchParams(newSearchParams, { replace: true });
  }, [selectedCategory, debouncedSearchQuery, sortBy, showFeaturedOnly, setSearchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    // Fetch category stats on component mount
    fetchCategoryStats();
  }, []);

  const handleLoadMore = () => {
    if (pagination.hasNext) {
      fetchCampaigns(pagination.page + 1, selectedCategory, searchQuery, sortBy, showFeaturedOnly);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('recent');
    setShowFeaturedOnly(false);
  };

  const getSortIcon = (sortType: string) => {
    switch (sortType) {
      case 'recent': return <Clock className="w-4 h-4" />;
      case 'goal': return <Target className="w-4 h-4" />;
      case 'raised': return <TrendingUp className="w-4 h-4" />;
      default: return <SortAsc className="w-4 h-4" />;
    }
  };

  const getSortLabel = (sortType: string) => {
    switch (sortType) {
      case 'recent': return 'Most Recent';
      case 'goal': return 'Highest Goal';
      case 'raised': return 'Most Raised';
      default: return 'Default';
    }
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedCategory !== 'All') count++;
    if (searchQuery) count++;
    if (sortBy !== 'recent') count++;
    if (showFeaturedOnly) count++;
    return count;
  };

  if (loading && campaigns.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        
        {/* Header */}
        <section className="py-12 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold mb-4">All Campaigns</h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover amazing campaigns and make a difference in someone's life today.
              </p>
            </div>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search campaigns..."
                className="pl-12 py-3 text-lg"
                disabled
              />
            </div>
          </div>
        </section>

        {/* Loading Grid */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-lg h-96"></div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <section className="py-12">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Campaigns</h1>
            <p className="text-red-500 mb-4">{error}</p>
            <Button onClick={() => fetchCampaigns(1, selectedCategory, searchQuery)}>
              Try Again
            </Button>
          </div>
        </section>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Header */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">All Campaigns</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover amazing campaigns and make a difference in someone's life today.
            </p>
          </div>
          
          {/* Search Bar */}
          <div className="max-w-lg mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Search campaigns..."
              className="pl-12 pr-12 py-3 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <CategoryFilter 
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        totalCampaigns={pagination.total}
        categoryCounts={categoryCounts}
      />

      {/* Campaigns Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">
              {pagination.total} Campaign{pagination.total !== 1 ? 's' : ''} Found
              {selectedCategory !== 'All' && (
                <span className="text-lg text-muted-foreground font-normal ml-2">
                  in {selectedCategory}
                </span>
              )}
            </h2>
            
            <div className="flex items-center gap-3">
              {/* Active Filters Indicator */}
              {getActiveFilterCount() > 0 && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {getActiveFilterCount()} filter{getActiveFilterCount() !== 1 ? 's' : ''} active
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAllFilters}
                    className="text-xs text-muted-foreground hover:text-destructive"
                  >
                    Clear all
                  </Button>
                </div>
              )}
              
              {/* Sort & Filter Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Sort & Filter
                    {getActiveFilterCount() > 0 && (
                      <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <SortAsc className="w-4 h-4" />
                    Sort By
                  </DropdownMenuLabel>
                  <DropdownMenuRadioGroup value={sortBy} onValueChange={setSortBy}>
                    <DropdownMenuRadioItem value="recent" className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Most Recent
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="raised" className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Most Raised
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem value="goal" className="flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Highest Goal
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                  
                  <DropdownMenuSeparator />
                  
                  <DropdownMenuLabel className="flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => setShowFeaturedOnly(!showFeaturedOnly)}
                    className="flex items-center justify-between"
                  >
                    <span className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Featured Only
                    </span>
                    {showFeaturedOnly && (
                      <Badge variant="secondary" className="text-xs">On</Badge>
                    )}
                  </DropdownMenuItem>
                  
                  {getActiveFilterCount() > 0 && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleClearAllFilters}
                        className="text-destructive focus:text-destructive"
                      >
                        Clear All Filters
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Active Filters Display */}
          {(searchQuery || selectedCategory !== 'All' || sortBy !== 'recent' || showFeaturedOnly) && (
            <div className="mb-6 flex flex-wrap gap-2">
              {searchQuery && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <Search className="w-3 h-3" />
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery('')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {selectedCategory !== 'All' && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  Category: {selectedCategory}
                  <button
                    onClick={() => setSelectedCategory('All')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {sortBy !== 'recent' && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  {getSortIcon(sortBy)}
                  {getSortLabel(sortBy)}
                  <button
                    onClick={() => setSortBy('recent')}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {showFeaturedOnly && (
                <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
                  <Users className="w-3 h-3" />
                  Featured Only
                  <button
                    onClick={() => setShowFeaturedOnly(false)}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          )}
          
          {campaigns.length === 0 ? (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <Search className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">No campaigns found</h3>
                <p className="text-muted-foreground mb-6">
                  {searchQuery || selectedCategory !== 'All' || showFeaturedOnly 
                    ? "No campaigns match your current filters. Try adjusting your search criteria."
                    : "There are no campaigns available at the moment."
                  }
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {searchQuery && (
                    <Button onClick={() => setSearchQuery('')} variant="outline">
                      Clear search
                    </Button>
                  )}
                  {(selectedCategory !== 'All' || showFeaturedOnly || sortBy !== 'recent') && (
                    <Button onClick={handleClearAllFilters} variant="outline">
                      Clear all filters
                    </Button>
                  )}
                  <Button onClick={() => window.location.href = '/campaigns'}>
                    View all campaigns
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {campaigns.map((campaign) => (
                <CampaignCard key={campaign.id} {...campaign} />
              ))}
            </div>
          )}
          
          {/* Load More */}
          {pagination.hasNext && (
            <div className="text-center mt-12">
              <Button 
                variant="outline" 
                size="lg" 
                onClick={handleLoadMore}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Campaigns'}
              </Button>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};
