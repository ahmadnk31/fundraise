import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

const DEFAULT_CATEGORIES = [
  { name: "All", count: 0 },
  { name: "Medical", count: 0 },
  { name: "Education", count: 0 },
  { name: "Emergency", count: 0 },
  { name: "Community", count: 0 },
  { name: "Animals", count: 0 },
  { name: "Sports", count: 0 },
  { name: "Creative", count: 0 },
  { name: "Technology", count: 0 },
  { name: "Environment", count: 0 }
];

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  totalCampaigns?: number;
  categoryCounts?: Record<string, number>;
}

export function CategoryFilter({ 
  selectedCategory, 
  onCategoryChange, 
  totalCampaigns = 0,
  categoryCounts = {} 
}: CategoryFilterProps) {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);

  useEffect(() => {
    // Update categories with actual counts and sort them
    const updatedCategories = DEFAULT_CATEGORIES.map(category => ({
      ...category,
      count: category.name === "All" 
        ? totalCampaigns 
        : categoryCounts[category.name] || 0
    })).sort((a, b) => {
      // Keep "All" first, then sort by count descending
      if (a.name === "All") return -1;
      if (b.name === "All") return 1;
      return b.count - a.count;
    });
    
    setCategories(updatedCategories);
  }, [totalCampaigns, categoryCounts]);

  const currentCount = selectedCategory === "All" 
    ? totalCampaigns 
    : categoryCounts[selectedCategory] || 0;

  return (
    <section className="py-8 border-b">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground">
            {currentCount.toLocaleString()} campaign{currentCount !== 1 ? 's' : ''}
            {selectedCategory !== "All" && (
              <span className="ml-2 text-primary font-medium">
                in {selectedCategory}
              </span>
            )}
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {categories.slice(0, 5).map((category) => (
            <Button
              key={category.name}
              variant={selectedCategory === category.name ? "default" : "outline"}
              size="lg"
              className={`relative transition-all duration-200 ${
                selectedCategory === category.name 
                  ? "bg-gradient-primary hover:opacity-90 shadow-md scale-105" 
                  : "hover:bg-primary/10 hover:border-primary/30 hover:scale-105"
              }`}
              onClick={() => onCategoryChange(category.name)}
              disabled={category.count === 0 && category.name !== "All"}
            >
              {category.name}
              {category.count > 0 && (
                <Badge 
                  variant={selectedCategory === category.name ? "secondary" : "outline"}
                  className={`ml-2 text-xs ${
                    selectedCategory === category.name 
                      ? "bg-white/20 text-white border-white/30" 
                      : ""
                  }`}
                >
                  {category.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>
        
        {/* Show more categories in a smaller section */}
        {categories.length > 5 && (
          <div className="flex flex-wrap gap-2">
            {categories.slice(5).map((category) => (
              <Button
                key={category.name}
                variant={selectedCategory === category.name ? "default" : "outline"}
                size="sm"
                className={`relative transition-all duration-200 ${
                  selectedCategory === category.name 
                    ? "bg-gradient-primary hover:opacity-90 shadow-md" 
                    : "hover:bg-primary/10 hover:border-primary/30"
                }`}
                onClick={() => onCategoryChange(category.name)}
                disabled={category.count === 0 && category.name !== "All"}
              >
                {category.name}
                {category.count > 0 && (
                  <Badge 
                    variant={selectedCategory === category.name ? "secondary" : "outline"}
                    className={`ml-2 text-xs ${
                      selectedCategory === category.name 
                        ? "bg-white/20 text-white border-white/30" 
                        : ""
                    }`}
                  >
                    {category.count}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        )}
        
        {selectedCategory !== "All" && (
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCategoryChange("All")}
              className="text-muted-foreground hover:text-primary"
            >
              ← View all categories
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}