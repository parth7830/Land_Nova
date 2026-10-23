'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Compass,
  MapPin,
  Search,
  Filter,
  Flame,
  BarChart3,
  GitCompare,
  HardHat,
  Users,
  Building2,
  ChevronDown,
  Layers,
  Sparkles,
  UserCheck,
  X
} from 'lucide-react';
import { LocationItem } from '@/types';
import { searchLocations } from '@/lib/api';

interface NavbarProps {
  currentRole: 'gateway' | 'buyer' | 'developer';
  onSwitchRole: (role: 'gateway' | 'buyer' | 'developer') => void;
  currentView: string;
  onNavigateView: (view: string) => void;
  selectedLocation: LocationItem;
  onSelectLocation: (loc: LocationItem) => void;
  onFilterChange?: (filters: any) => void;
}

export default function Navbar({
  currentRole,
  onSwitchRole,
  currentView,
  onNavigateView,
  selectedLocation,
  onSelectLocation,
  onFilterChange,
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Filter Popovers
  const [showPricePopover, setShowPricePopover] = useState(false);
  const [showAreaPopover, setShowAreaPopover] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([500, 3500]);
  const [listingTypeFilter, setListingTypeFilter] = useState<'buy' | 'rent'>('buy');

  const searchRef = useRef<HTMLDivElement>(null);

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchChange = async (q: string) => {
    setSearchQuery(q);
    if (q.trim().length >= 2) {
      setIsSearching(true);
      setShowSearchDropdown(true);
      try {
        const results = await searchLocations(q);
        setSearchResults(results);
      } catch (err) {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  };

  const handleSelectLoc = (loc: LocationItem) => {
    onSelectLocation(loc);
    setSearchQuery(loc.display_name.split(',')[0]);
    setShowSearchDropdown(false);
  };

  const applyPriceFilter = () => {
    setShowPricePopover(false);
    if (onFilterChange) {
      onFilterChange({ minPrice: priceRange[0], maxPrice: priceRange[1], listingType: listingTypeFilter });
    }
  };

  const applyAreaFilter = () => {
    setShowAreaPopover(false);
    if (onFilterChange) {
      onFilterChange({ minArea: areaRange[0], maxArea: areaRange[1] });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#090d16]/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div
              onClick={() => onSwitchRole('gateway')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              title="Return to Page 1: Role Gateway"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-950/40 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
                  LANDNOVA
                  <span className={`text-[10px] font-semibold tracking-wider px-1.5 py-0.2 rounded uppercase ${
                    currentRole === 'buyer'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                  }`}>
                    {currentRole === 'buyer' ? 'BUYER' : 'DEVELOPER'}
                  </span>
                </span>
                <p className="text-[10px] text-slate-400 tracking-tight">The Location Is the Decision.</p>
              </div>
            </div>

            {/* Middle Nav Items */}
            <div className="flex items-center gap-2">
              {currentRole === 'buyer' ? (
                <>
                  <button
                    onClick={() => onNavigateView('preferences')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'preferences' || currentView === 'heatmap'
                        ? 'bg-emerald-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Heatmap
                  </button>

                  {/* Area Filter Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowAreaPopover(!showAreaPopover)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
                    >
                      Area <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showAreaPopover && (
                      <div className="absolute top-full left-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-50 animate-in fade-in">
                        <h4 className="text-xs font-semibold text-white mb-2">Area Range (sq ft)</h4>
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                          <span>{areaRange[0]} sqft</span>
                          <span>{areaRange[1]} sqft</span>
                        </div>
                        <input
                          type="range"
                          min="300"
                          max="5000"
                          step="100"
                          value={areaRange[1]}
                          onChange={(e) => setAreaRange([areaRange[0], parseInt(e.target.value)])}
                          className="w-full accent-emerald-500 mb-4"
                        />
                        <button
                          onClick={applyAreaFilter}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
                        >
                          Apply Filter
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Price Filter Trigger */}
                  <div className="relative">
                    <button
                      onClick={() => setShowPricePopover(!showPricePopover)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-700/60 transition-colors"
                    >
                      Price <ChevronDown className="w-3 h-3 text-slate-400" />
                    </button>

                    {showPricePopover && (
                      <div className="absolute top-full left-0 mt-2 w-72 bg-slate-900 border border-slate-700 rounded-xl p-4 shadow-xl z-50 animate-in fade-in">
                        <div className="flex gap-2 mb-3">
                          <button
                            onClick={() => setListingTypeFilter('buy')}
                            className={`flex-1 py-1 text-xs rounded-lg font-medium ${
                              listingTypeFilter === 'buy' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Buy
                          </button>
                          <button
                            onClick={() => setListingTypeFilter('rent')}
                            className={`flex-1 py-1 text-xs rounded-lg font-medium ${
                              listingTypeFilter === 'rent' ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Rent
                          </button>
                        </div>
                        <h4 className="text-xs font-semibold text-white mb-2">Max Budget</h4>
                        <p className="text-xs text-emerald-400 mb-2">
                          {listingTypeFilter === 'buy'
                            ? `Up to ₹${(priceRange[1] / 100000).toFixed(0)} Lakhs`
                            : `Up to ₹${(priceRange[1] / 1000).toFixed(0)}k / month`}
                        </p>
                        <input
                          type="range"
                          min={listingTypeFilter === 'buy' ? 1000000 : 10000}
                          max={listingTypeFilter === 'buy' ? 80000000 : 150000}
                          step={listingTypeFilter === 'buy' ? 500000 : 5000}
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                          className="w-full accent-emerald-500 mb-4"
                        />
                        <button
                          onClick={applyPriceFilter}
                          className="w-full py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium rounded-lg"
                        >
                          Apply Filter
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                /* Developer Navigation Links */
                <>
                  <button
                    onClick={() => onNavigateView('site-report')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'site-report'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
                    Site Analysis
                  </button>
                  <button
                    onClick={() => onNavigateView('heatmap')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'heatmap'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                    Heatmap
                  </button>
                  <button
                    onClick={() => onNavigateView('compare')}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      currentView === 'compare'
                        ? 'bg-amber-600 text-white font-semibold'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <GitCompare className="w-3.5 h-3.5 text-amber-400" />
                    Compare Sites
                  </button>
                </>
              )}
            </div>

            {/* Search City Autocomplete Input */}
            <div ref={searchRef} className="relative flex-1 max-w-xs hidden md:block">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search City or Locality..."
                  className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
                {isSearching && (
                  <div className="w-3 h-3 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                )}
              </div>

              {showSearchDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                  {searchResults.map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => handleSelectLoc(loc)}
                      className="w-full text-left px-3.5 py-2.5 hover:bg-slate-800 flex items-start gap-2 border-b border-slate-800/60 last:border-0"
                    >
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-white">{loc.display_name.split(',')[0]}</p>
                        <p className="text-[10px] text-slate-400 truncate">{loc.display_name}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Controls: Switch Role & Auth */}
            <div className="flex items-center gap-2">
              {/* Return to Role Gateway */}
              <button
                onClick={() => onSwitchRole('gateway')}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-xs font-medium text-slate-300 border border-slate-700 transition-colors"
                title="Return to Page 1: Role Gateway"
              >
                <span>Role Gateway</span>
              </button>

              {/* Role Toggle Button */}
              <button
                onClick={() => onSwitchRole(currentRole === 'buyer' ? 'developer' : 'buyer')}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-colors"
                title={`Switch to ${currentRole === 'buyer' ? 'Real Estate Developer' : 'Buyer / Renter'} View`}
              >
                {currentRole === 'buyer' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-amber-400" />
                    <span className="hidden lg:inline">Developer Mode</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="hidden lg:inline">Buyer Mode</span>
                  </>
                )}
              </button>

              {/* Auth Buttons */}
              <button
                onClick={() => {
                  setAuthMode('login');
                  setShowAuthModal(true);
                }}
                className="px-3 py-1.5 text-xs text-slate-300 hover:text-white transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => {
                  setAuthMode('signup');
                  setShowAuthModal(true);
                }}
                className={`px-3 py-1.5 text-xs text-white font-medium rounded-lg transition-colors ${
                  currentRole === 'buyer'
                    ? 'bg-emerald-600 hover:bg-emerald-500'
                    : 'bg-amber-600 hover:bg-amber-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Auth Modal (Optional Demo Mode) */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-4">
              <UserCheck className="w-5 h-5 text-emerald-400" />
            </div>

            <h3 className="text-base font-bold text-white mb-1">
              {authMode === 'login' ? 'Sign In to LandNova' : 'Create Free Account'}
            </h3>
            <p className="text-xs text-slate-400 mb-5">
              Save your preference profiles, shortlisted properties, and site feasibility reports.
            </p>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setShowAuthModal(false);
                  alert('Google OAuth Demo: Logged in successfully as test user.');
                }}
                className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-white rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z" />
                  <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z" />
                  <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.5.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.4 1.9 7.8l3.7-2.9z" />
                  <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2-6.4-4.8L1.9 16.9C3.7 20.6 7.5 23.5 12 23.5z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-[10px] text-slate-500 uppercase">Or Demo Guest Mode</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                onClick={() => setShowAuthModal(false)}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-xs font-medium text-white rounded-xl transition-colors"
              >
                Proceed as Demo Guest (No Login Required)
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
