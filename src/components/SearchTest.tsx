import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import ApiService from '../services/api.service';

// Simple test component to debug the search functionality
export const SearchTest: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      setLoading(true);
      setError(null);
      console.log('Testing search with query:', query);
      
      const response = await ApiService.getCampaigns({
        search: query,
        limit: 8,
        page: 1,
      });
      
      console.log('Search response:', response);
      setResults(response);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Search Test</h2>
      
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search campaigns..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          <Search className="w-4 h-4" />
          {loading ? 'Searching...' : 'Search'}
        </Button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded mb-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      )}

      {results && (
        <div className="space-y-4">
          <h3 className="text-lg font-medium">
            Results ({results.data?.campaigns?.length || 0} campaigns found)
          </h3>
          
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto">
            {JSON.stringify(results, null, 2)}
          </pre>

          {results.data?.campaigns?.map((campaign: any) => (
            <div key={campaign.id} className="p-4 border rounded">
              <h4 className="font-medium">{campaign.title}</h4>
              <p className="text-sm text-gray-600">{campaign.summary}</p>
              <p className="text-xs text-gray-500">
                {campaign.category} • ${campaign.currentAmount} of ${campaign.goalAmount}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
