import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, Menu, Plus, LogOut } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { FullscreenSearch } from "./FullscreenSearch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleCampaignSelect = (campaignId: string) => {
    navigate(`/campaign/${campaignId}`);
  };

  // Keyboard shortcut: Cmd/Ctrl + K to open search
  useKeyboardShortcut(
    { key: 'k', meta: true }, // Mac: Cmd + K
    () => setIsSearchOpen(true),
    [setIsSearchOpen]
  );
  
  useKeyboardShortcut(
    { key: 'k', ctrl: true }, // Windows/Linux: Ctrl + K
    () => setIsSearchOpen(true),
    [setIsSearchOpen]
  );

  return (
    <nav className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-4">
            <Link to="/">
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                FundRaise
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors">
              Discover
            </Link>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors">
              How it works
            </a>
            <a href="#success-stories" className="text-foreground hover:text-primary transition-colors">
              Success stories
            </a>
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex relative flex-1 max-w-md mx-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10 pr-16 bg-muted/50 cursor-pointer"
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted rounded px-1.5 py-0.5 border">
              ⌘K
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {isAuthenticated ? (
              <>
                <Link to="/create-campaign">
                  <Button className="hidden md:flex bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Campaign
                  </Button>
                </Link>
                
                <Button variant="ghost" size="sm" className="hidden md:flex">
                  <Heart className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <User className="w-4 h-4" />
                      <span className="hidden md:ml-2 md:inline">
                        {user?.firstName}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="hidden md:flex">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-primary hover:opacity-90">
                    Get started
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t pt-4">
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-10 bg-muted/50"
                />
              </div>
              
              <div className="space-y-2">
                <Link to="/">
                  <Button variant="ghost" className="w-full justify-start">
                    Discover
                  </Button>
                </Link>
                <Button variant="ghost" className="w-full justify-start">
                  How it works
                </Button>
                <Button variant="ghost" className="w-full justify-start">
                  Success stories
                </Button>
              </div>
              
              {isAuthenticated ? (
                <div className="space-y-2">
                  <Link to="/create-campaign">
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Campaign
                    </Button>
                  </Link>
                  <Link to="/dashboard">
                    <Button variant="outline" className="w-full">
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link to="/login">
                    <Button variant="outline" className="w-full">
                      Sign in
                    </Button>
                  </Link>
                  <Link to="/register">
                    <Button className="w-full bg-gradient-primary hover:opacity-90">
                      Get started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Search */}
      <FullscreenSearch
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onCampaignSelect={handleCampaignSelect}
      />
    </nav>
  );
}