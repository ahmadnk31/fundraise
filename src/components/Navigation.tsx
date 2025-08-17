import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Heart, User, Menu, Plus, LogOut } from "lucide-react";
import { useState, useEffect, useRef } from "react";
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
  const navRef = useRef<HTMLElement>(null);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false);
  }, [navigate]);

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
    <nav ref={navRef} className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-3 sm:px-4 py-3">
        <div className="flex items-center justify-between min-w-0">
          {/* Logo */}
          <div className="flex items-center space-x-4 min-w-0">
            <Link to="/" onClick={() => setIsMenuOpen(false)} className="min-w-0">
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent truncate">
                FundRaise
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-6">
            <Link to="/" className="text-foreground hover:text-primary transition-colors whitespace-nowrap">
              Discover
            </Link>
            <a href="#how-it-works" className="text-foreground hover:text-primary transition-colors whitespace-nowrap">
              How it works
            </a>
            <a href="#success-stories" className="text-foreground hover:text-primary transition-colors whitespace-nowrap">
              Success stories
            </a>
          </div>

          {/* Search Bar - Hidden on small screens, visible on medium+ */}
          <div className="hidden md:flex relative flex-1 max-w-xs lg:max-w-md mx-3 lg:mx-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search campaigns..."
              className="pl-10 pr-12 lg:pr-16 bg-muted/50 cursor-pointer text-sm"
              onClick={() => setIsSearchOpen(true)}
              readOnly
            />
            <div className="absolute right-2 lg:right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground bg-muted rounded px-1 lg:px-1.5 py-0.5 border">
              ⌘K
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-1 min-w-0">
            {isAuthenticated ? (
              <>
                <Link to="/create-campaign" className="hidden sm:block">
                  <Button className="hidden md:flex bg-gradient-primary hover:opacity-90 text-sm px-3 lg:px-4">
                    <Plus className="w-4 h-4 mr-1 lg:mr-2" />
                    <span className="hidden lg:inline">Start Campaign</span>
                    <span className="lg:hidden">Start</span>
                  </Button>
                </Link>
                
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden lg:flex px-2"
                  onClick={() => navigate('/dashboard?tab=saved')}
                  title="Saved Campaigns"
                >
                  <Heart className="w-4 h-4" />
                </Button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="px-2 min-w-0">
                      <User className="w-4 h-4 flex-shrink-0" />
                      <span className="hidden sm:ml-2 sm:inline max-w-16 lg:max-w-20 truncate">
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
                <Link to="/login" className="hidden sm:block">
                  <Button variant="ghost" className="hidden md:flex text-sm px-3 mb-1">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-gradient-primary hover:opacity-90 text-sm px-3 sm:px-4">
                    <span className="sm:hidden">Join</span>
                    <span className="hidden sm:inline">Get started</span>
                  </Button>
                </Link>
              </>
            )}
            
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="md:hidden px-2 flex-shrink-0"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="w-4 h-4" />
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden px-2 flex-shrink-0"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t pt-4 space-y-4">
            {/* Mobile Search - Only show on small screens where desktop search is hidden */}
            <div className="md:hidden">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search campaigns..."
                  className="pl-10 bg-muted/50 cursor-pointer"
                  onClick={() => {
                    setIsSearchOpen(true);
                    setIsMenuOpen(false);
                  }}
                  readOnly
                />
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="space-y-2">
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start">
                  Discover
                </Button>
              </Link>
              <button 
                onClick={() => {
                  document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                <Button variant="ghost" className="w-full justify-start">
                  How it works
                </Button>
              </button>
              <button 
                onClick={() => {
                  document.getElementById('success-stories')?.scrollIntoView({ behavior: 'smooth' });
                  setIsMenuOpen(false);
                }}
                className="w-full"
              >
                <Button variant="ghost" className="w-full justify-start">
                  Success stories
                </Button>
              </button>
            </div>
            
            {/* Action Buttons */}
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link to="/create-campaign" className="mb-2" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    <Plus className="w-4 h-4 mr-2" />
                    Start Campaign
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Dashboard
                  </Button>
                </Link>
                <Link to="/profile" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    Profile
                  </Button>
                </Link>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="outline" className="w-full">
                    Sign in
                  </Button>
                </Link>
                <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-primary hover:opacity-90">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
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