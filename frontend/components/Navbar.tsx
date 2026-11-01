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
  Bell,
  User,
  X,
  LogOut
} from 'lucide-react';
import { LocationItem } from '@/types';
import { searchLocations, fetchCurrentUser, logoutUser, UserProfile, getStoredUser } from '@/lib/api';
import AuthModal from './AuthModal';

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
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  useEffect(() => {
    const cached = getStoredUser();
    if (cached) setCurrentUser(cached);
    fetchCurrentUser().then((user) => {
      if (user) setCurrentUser(user);
    });
  }, []);

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 50000000]);
  const [areaRange, setAreaRange] = useState<[number, number]>([500, 3500]);
  const [listingTypeFilter, setListingTypeFilter] = useState<'buy' | 'rent'>('buy');

  const searchRef = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Local instant suggestions for major Indian hubs (0ms latency)
  const INSTANT_CITIES: LocationItem[] = [
    {
      id: 'sector-62-noida',
      display_name: 'Sector 62, Noida, Uttar Pradesh, India',
      locality: 'Sector 62',
      city: 'Noida',
      state: 'Uttar Pradesh',
      country: 'India',
      latitude: 28.6280,
      longitude: 77.3649,
      is_demo: true,
      source: 'Instant Local Suggestion'
    },
    {
      id: 'connaught-place-delhi',
      display_name: 'Connaught Place, New Delhi, Delhi, India',
      locality: 'Connaught Place',
      city: 'New Delhi',
      state: 'Delhi',
      country: 'India',
      latitude: 28.6315,
      longitude: 77.2167,
      is_demo: true,
      source: 'Instant Local Suggestion'
    },
    {
      id: 'gurugram-haryana',
      display_name: 'Cyber City, Gurugram, Haryana, India',
      locality: 'Cyber City',
      city: 'Gurugram',
      state: 'Haryana',
      country: 'India',
      latitude: 28.4595,
      longitude: 77.0266,
      is_demo: true,
      source: 'Instant Local Suggestion'
    },
    {
      id: 'bkc-mumbai',
      display_name: 'Bandra Kurla Complex, Mumbai, Maharashtra, India',
      locality: 'BKC',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      latitude: 19.0657,
      longitude: 72.8687,
      is_demo: true,
      source: 'Instant Local Suggestion'
    },
    {
      id: 'indiranagar-bengaluru',
      display_name: 'Indiranagar, Bengaluru, Karnataka, India',
      locality: 'Indiranagar',
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      latitude: 12.9784,
      longitude: 77.6408,
      is_demo: true,
      source: 'Instant Local Suggestion'
    },
    {
      id: 'hitec-city-hyderabad',
      display_name: 'HITEC City, Hyderabad, Telangana, India',
      locality: 'HITEC City',
      city: 'Hyderabad',
      state: 'Telangana',
      country: 'India',
      latitude: 17.4435,
      longitude: 78.3772,
      is_demo: true,
      source: 'Instant Local Suggestion'
    }
  ];

  // Close search dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
      if (abortControllerRef.current) abortControllerRef.current.abort();
    };
  }, []);

  const handleSearchChange = (q: string) => {
    setSearchQuery(q);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const trimmed = q.trim();

    // Instant local matching (0ms)
    const localMatches = trimmed.length > 0
      ? INSTANT_CITIES.filter(
          (c) =>
            (c.city || '').toLowerCase().includes(trimmed.toLowerCase()) ||
            c.display_name.toLowerCase().includes(trimmed.toLowerCase())
        )
      : [];

    // Min 3 chars for remote network requests (Requirement 1)
    if (trimmed.length < 3) {
      setSearchResults(localMatches);
      setShowSearchDropdown(localMatches.length > 0);
      setIsSearching(false);
      return;
    }

    // Show local matches immediately while debouncing network request
    if (localMatches.length > 0) {
      setSearchResults(localMatches);
      setShowSearchDropdown(true);
    }

    // Debounce input 400ms & abort stale requests (Requirement 1)
    setIsSearching(true);
    searchTimeoutRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortControllerRef.current = controller;

      try {
        const results = await searchLocations(trimmed, controller.signal);
        setSearchResults(results.length > 0 ? results : localMatches);
        setShowSearchDropdown(true);
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          setSearchResults(localMatches);
        }
      } finally {
        setIsSearching(false);
      }
    }, 400);
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
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div
              onClick={() => onSwitchRole('gateway')}
              className="flex items-center gap-3 cursor-pointer group shrink-0"
              title="Return to Page 1: Role Gateway"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Compass className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold tracking-tight text-slate-900 flex items-center gap-1.5">
                  LANDNOVA
                  <span className={`text-[10px] font-semibold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                    currentRole === 'buyer'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border border-amber-200'
                  }`}>
                    {currentRole === 'buyer' ? 'BUYER' : 'DEVELOPER'}
                  </span>
                </span>
                <p className="text-[10px] text-slate-500 tracking-tight">The Location Is the Decision.</p>
              </div>
            </div>



            {/* Right Controls: Search City + Notification Bell + Avatar */}
            <div className="flex items-center gap-2.5">
              {/* Search City Autocomplete Input */}
              <div ref={searchRef} className="relative w-44 sm:w-56 hidden sm:block">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search city / sector..."
                    className="w-full bg-slate-100 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:bg-white transition-all shadow-2xs"
                  />
                  {isSearching && (
                    <div className="w-3 h-3 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin absolute right-3 top-1/2 -translate-y-1/2" />
                  )}
                </div>

                {showSearchDropdown && searchResults.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {searchResults.map((loc) => (
                      <button
                        key={loc.id}
                        onClick={() => handleSelectLoc(loc)}
                        className="w-full text-left px-3.5 py-2 hover:bg-slate-50 flex items-start gap-2 border-b border-slate-100 last:border-0"
                      >
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-slate-900">{loc.display_name.split(',')[0]}</p>
                          <p className="text-[10px] text-slate-500 truncate">{loc.display_name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Notification Bell */}
              <button
                className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                title="Notifications"
                onClick={() => alert('Notifications: All geospatial and air quality datasets are live and verified.')}
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              </button>

              {/* User Avatar & Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    if (currentUser) {
                      setShowUserDropdown(!showUserDropdown);
                    } else {
                      setAuthMode('login');
                      setShowAuthModal(true);
                    }
                  }}
                  className={`h-8 px-2.5 rounded-full border text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105 transition-all ${
                    currentUser
                      ? 'bg-emerald-600 border-emerald-700 text-white'
                      : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                  }`}
                  title={currentUser ? `${currentUser.full_name} (${currentUser.role})` : 'Account Profile / Login'}
                >
                  <User className={`w-3.5 h-3.5 ${currentUser ? 'text-white' : 'text-emerald-700'}`} />
                  <span className="hidden sm:inline max-w-[90px] truncate text-[11px]">
                    {currentUser ? currentUser.full_name.split(' ')[0] : 'Sign In'}
                  </span>
                </button>

                {/* User Profile Dropdown */}
                {currentUser && showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl bg-white border border-slate-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900 truncate">{currentUser.full_name}</p>
                      <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                      <div className="mt-1.5 flex items-center gap-1.5">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
                          {currentUser.role}
                        </span>
                        {currentUser.organization && (
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {currentUser.organization}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <button
                        onClick={() => {
                          setShowUserDropdown(false);
                          onSwitchRole(currentUser.role === 'developer' ? 'developer' : 'buyer');
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        {currentUser.role === 'developer' ? (
                          <>
                            <Building2 className="w-3.5 h-3.5 text-amber-600" />
                            <span>Developer Feasibility Dossier</span>
                          </>
                        ) : (
                          <>
                            <Users className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Buyer Suitability Explorer</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={async () => {
                          setShowUserDropdown(false);
                          await logoutUser();
                          setCurrentUser(null);
                        }}
                        className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer transition-colors"
                      >
                        <LogOut className="w-3.5 h-3.5 text-rose-500" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Role Switcher Pill */}
              <button
                onClick={() => onSwitchRole(currentRole === 'buyer' ? 'developer' : 'buyer')}
                className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-bold text-slate-800 transition-colors cursor-pointer"
                title={`Switch to ${currentRole === 'buyer' ? 'Developer' : 'Buyer'} View`}
              >
                {currentRole === 'buyer' ? (
                  <>
                    <Building2 className="w-3.5 h-3.5 text-amber-600" />
                    <span>Developer</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Buyer</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Database-Backed Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        initialMode={authMode}
        onClose={() => setShowAuthModal(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'developer' && currentRole !== 'developer') {
            onSwitchRole('developer');
          }
        }}
      />
    </>
  );
}
