import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Clock, TrendingUp, Users, MapPin } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import ApiService from '../services/api.service';
import { Campaign } from '../types';

interface FullscreenSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onCampaignSelect: (campaignId: string) => void;
}

interface SearchResult {
  campaigns: Campaign[];
  users: any[];
  categories: string[];
}

export const FullscreenSearch: React.FC<FullscreenSearchProps> = ({
  isOpen,
  onClose,
  onCampaignSelect,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    campaigns: [],
    users: [],
    categories: [],
  });
  const [loading, setLoading] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('recentSearches');
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Debounced search effect
  useEffect(() => {
    if (!query.trim()) {
      setResults({ campaigns: [], users: [], categories: [] });
      return;
    }

    console.log('Setting up search timer for:', query);
    const timer = setTimeout(async () => {
      console.log('Executing search for:', query);
      await performSearch(query);
    }, 300);

    return () => {
      console.log('Clearing search timer');
      clearTimeout(timer);
    };
  }, [query]);

  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    try {
      setLoading(true);
      console.log('FullscreenSearch: Performing search for:', searchQuery);
      
      // Search campaigns
      const campaignResponse = await ApiService.getCampaigns({
        search: searchQuery,
        limit: 8,
        page: 1,
      });

      console.log('FullscreenSearch: API response:', campaignResponse);

      // For demo purposes, we'll also search for categories that match
      const categories = [
        'Education', 'Health', 'Environment', 'Technology', 'Arts',
        'Community', 'Sports', 'Emergency', 'Animals', 'Nonprofit'
      ].filter(cat => 
        cat.toLowerCase().includes(searchQuery.toLowerCase())
      );

      const searchResults = {
        campaigns: campaignResponse.data?.campaigns || [],
        users: [], // TODO: Implement user search when backend supports it
        categories,
      };

      console.log('FullscreenSearch: Setting results:', searchResults);
      setResults(searchResults);

    } catch (error) {
      console.error('FullscreenSearch: Search error:', error);
      setResults({ campaigns: [], users: [], categories: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (searchQuery: string) => {
    if (!searchQuery.trim()) return;

    // Add to recent searches
    const newRecentSearches = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery),
    ].slice(0, 5);
    
    setRecentSearches(newRecentSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newRecentSearches));
    
    performSearch(searchQuery);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const totalResults = results.campaigns.length + results.categories.length;
    
    switch (e.key) {
      case 'Escape':
        onClose();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex(prev => Math.min(prev + 1, totalResults - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex(prev => Math.max(prev - 1, 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex < results.campaigns.length) {
          const campaign = results.campaigns[activeIndex];
          onCampaignSelect(campaign.id);
          onClose();
        }
        break;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getProgressPercentage = (raised: number, goal: number) => {
    return Math.min((raised / goal) * 100, 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      {/* Modal Content */}
      <div className="relative z-10 h-full flex items-start justify-center pt-16">
        <div className="w-full max-w-4xl mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-h-[80vh] flex flex-col animate-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-6 h-6" />
              <Input
                ref={inputRef}
                placeholder="Search campaigns, categories, or creators..."
                className="pl-14 pr-14 py-4 text-lg border-2 focus:border-primary bg-white dark:bg-gray-800"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setQuery('')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {!query && (
              /* Recent Searches */
              <div className="space-y-6">
                {recentSearches.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Recent Searches
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {recentSearches.map((search, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-secondary/80"
                          onClick={() => setQuery(search)}
                        >
                          {search}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Categories */}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Popular Categories
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {['Education', 'Health', 'Environment', 'Technology', 'Arts', 'Community', 'Sports', 'Emergency'].map((category) => (
                      <Card
                        key={category}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => setQuery(category)}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="text-sm font-medium">{category}</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {query && (
              /* Search Results */
              <div className="space-y-6 overflow-y-auto h-full">
                {loading && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center gap-2 text-muted-foreground">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                      Searching for "{query}"...
                    </div>
                  </div>
                )}

                {!loading && (
                  <>
                    {/* Campaign Results */}
                    {results.campaigns.length > 0 && (
                      <div className="animate-in slide-in-from-bottom-4 duration-200">
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                          <Search className="w-4 h-4" />
                          Campaigns ({results.campaigns.length})
                        </h3>
                        <div className="space-y-3">
                          {results.campaigns.map((campaign, index) => {
                            const progress = getProgressPercentage(
                              parseFloat(campaign.currentAmount || '0'), 
                              parseFloat(campaign.goalAmount || '0')
                            );
                            const isActive = index === activeIndex;
                            
                            return (
                              <Card
                                key={campaign.id}
                                ref={(el) => (resultRefs.current[index] = el)}
                                className={`cursor-pointer hover:shadow-md transition-all ${
                                  isActive ? 'ring-2 ring-primary shadow-md' : ''
                                }`}
                                onClick={() => {
                                  onCampaignSelect(campaign.id);
                                  handleSearch(query);
                                  onClose();
                                }}
                              >
                                <CardContent className="p-4">
                                  <div className="flex gap-4">
                                    <div className="w-16 h-16 bg-muted rounded-lg flex-shrink-0 overflow-hidden">
                                      {campaign.coverImage ? (
                                        <img
                                          src={campaign.coverImage}
                                          alt={campaign.title}
                                          className="w-full h-full object-cover"
                                        />
                                      ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                                          <Search className="w-6 h-6 text-primary/60" />
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-start justify-between mb-2">
                                        <h4 className="font-medium truncate pr-2">{campaign.title}</h4>
                                        <Badge variant="secondary" className="flex-shrink-0">
                                          {campaign.category}
                                        </Badge>
                                      </div>
                                      
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                        {campaign.summary}
                                      </p>
                                      
                                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <div className="flex items-center gap-4">
                                          <span className="flex items-center gap-1">
                                            <Users className="w-3 h-3" />
                                            0 backers
                                          </span>
                                          {campaign.location && (
                                            <span className="flex items-center gap-1">
                                              <MapPin className="w-3 h-3" />
                                              {campaign.location}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-right">
                                          <div className="font-medium text-foreground">
                                            {formatCurrency(parseFloat(campaign.currentAmount || '0'))} raised
                                          </div>
                                          <div>{progress.toFixed(0)}% of {formatCurrency(parseFloat(campaign.goalAmount || '0'))}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Category Results */}
                    {results.categories.length > 0 && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-4 flex items-center gap-2">
                          <TrendingUp className="w-4 h-4" />
                          Categories ({results.categories.length})
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {results.categories.map((category, index) => {
                            const resultIndex = results.campaigns.length + index;
                            const isActive = resultIndex === activeIndex;
                            
                            return (
                              <Badge
                                key={category}
                                variant={isActive ? "default" : "secondary"}
                                className="cursor-pointer hover:bg-primary/90"
                                onClick={() => {
                                  // Navigate to campaigns page with this category filter
                                  window.location.href = `/campaigns?category=${encodeURIComponent(category)}`;
                                  handleSearch(query);
                                  onClose();
                                }}
                              >
                                Browse {category}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No Results */}
                    {!loading && results.campaigns.length === 0 && results.categories.length === 0 && query && (
                      <div className="text-center py-12">
                        <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">No results found for "{query}"</h3>
                        <p className="text-muted-foreground mb-6">
                          Try different keywords or browse our popular categories below
                        </p>
                        <Button
                          variant="outline"
                          onClick={() => setQuery('')}
                        >
                          Clear search
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-xs text-muted-foreground text-center">
            Use ↑↓ to navigate • Enter to select • Esc to close
          </div>
        </div>
      </div>
    </div>
  );
};
