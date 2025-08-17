import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ApiService from "@/services/api.service";

const DEFAULT_CATEGORIES = [
  { name: "Medical", count: 0 },
  { name: "Education", count: 0 },
  { name: "Emergency", count: 0 },
  { name: "Community", count: 0 },
  { name: "Animals", count: 0 },
  { name: "Sports", count: 0 },
  { name: "Creative", count: 0 },
  { name: "Technology", count: 0 }
];

export function HomepageCategoryFilter() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    const fetchCategoryStats = async () => {
      try {
        const response = await ApiService.getCategoryStats();
        const updatedCategories = DEFAULT_CATEGORIES.map(category => ({
          ...category,
          count: response.data.categories[category.name] || 0
        })).sort((a, b) => b.count - a.count);
        
        setCategories(updatedCategories.slice(0, 6)); // Show only top 6 categories
      } catch (err) {
        console.error('Error fetching category stats:', err);
      }
    };

    fetchCategoryStats();
  }, []);

  const handleCategoryClick = (categoryName: string) => {
    navigate(`/campaigns?category=${categoryName}`);
  };

  const handleViewAll = () => {
    navigate('/campaigns');
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Find campaigns that matter to you across different categories and causes
          </p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant="outline"
              className="h-auto p-6 flex flex-col items-center gap-3 hover:bg-primary/10 hover:border-primary/30 transition-all duration-200 hover:scale-105"
              onClick={() => handleCategoryClick(category.name)}
              disabled={category.count === 0}
            >
              <div className="text-2xl">
                {getCategoryIcon(category.name)}
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{category.name}</div>
                {category.count > 0 && (
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {category.count}
                  </Badge>
                )}
              </div>
            </Button>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Button 
            onClick={handleViewAll}
            className="bg-gradient-primary hover:opacity-90"
            size="lg"
          >
            View All Campaigns
          </Button>
        </div>
      </div>
    </section>
  );
}

function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    Medical: "🏥",
    Education: "📚",
    Emergency: "🚨",
    Community: "🤝",
    Animals: "🐾",
    Sports: "⚽",
    Creative: "🎨",
    Technology: "💻",
    Environment: "🌱"
  };
  return icons[category] || "📋";
}
