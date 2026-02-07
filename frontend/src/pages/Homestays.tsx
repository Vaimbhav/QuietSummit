import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, MapPin,
    Search, SlidersHorizontal, Check
} from 'lucide-react';
import { createPortal } from 'react-dom';
import PropertyCard from '../components/properties/PropertyCard';
import { searchProperties, getFilterOptions, getLocationSuggestions, Property, PropertySearchParams } from '../services/propertyApi';
import Loader from '../components/common/Loader';

export default function Homestays() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState<any>(null);
    const [filterOptions, setFilterOptions] = useState<any>(null);

    // UI State for Filters
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState(false);
    const isInitialLoad = useRef(true);

    // Applied filters (these trigger API calls)
    const [appliedFilters, setAppliedFilters] = useState<PropertySearchParams>({
        page: 1,
        limit: 12,
        city: searchParams.get('city') || undefined,
        search: searchParams.get('search') || undefined,
        minPrice: searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined,
        maxPrice: searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined,
        guests: searchParams.get('guests') ? Number(searchParams.get('guests')) : undefined,
        bedrooms: searchParams.get('bedrooms') ? Number(searchParams.get('bedrooms')) : undefined,
        propertyType: searchParams.get('propertyType') || undefined,
        sortBy: (searchParams.get('sortBy') as any) || 'newest',
    });

    // Local state for dropdown inputs
    const [draftFilters, setDraftFilters] = useState({
        minPrice: appliedFilters.minPrice?.toString() || '',
        maxPrice: appliedFilters.maxPrice?.toString() || '',
        guests: appliedFilters.guests?.toString() || '',
    });

    // Location Auto-complete State
    const [locationQuery, setLocationQuery] = useState(searchParams.get('city') || '');
    const [locationSuggestions, setLocationSuggestions] = useState<Array<{ city: string; state: string; count: number }>>([]);

    // Determine active filter count
    const activeFilterCount = [
        appliedFilters.minPrice || appliedFilters.maxPrice,
        appliedFilters.guests,
        appliedFilters.bedrooms,
        appliedFilters.propertyType,
        appliedFilters.city
    ].filter(Boolean).length;

    useEffect(() => {
        loadFilterOptions();
    }, []);

    // Close price dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isPriceDropdownOpen && !target.closest('.price-dropdown')) {
                setIsPriceDropdownOpen(false);
            }
        };

        if (isPriceDropdownOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [isPriceDropdownOpen]);

    // Fetch location suggestions
    useEffect(() => {
        const fetchLocationSuggestions = async () => {
            if (locationQuery.length < 1) {
                setLocationSuggestions([]);
                return;
            }
            try {
                const response = await getLocationSuggestions(locationQuery);
                setLocationSuggestions(response.suggestions || []);
            } catch (error) {
                console.error('Error:', error);
            }
        };
        const timeoutId = setTimeout(fetchLocationSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [locationQuery]);

    useEffect(() => {
        loadProperties();
    }, [appliedFilters]);

    // Sync draft filters with applied filters
    useEffect(() => {
        setDraftFilters({
            minPrice: appliedFilters.minPrice?.toString() || '',
            maxPrice: appliedFilters.maxPrice?.toString() || '',
            guests: appliedFilters.guests?.toString() || '',
        });
    }, [appliedFilters.minPrice, appliedFilters.maxPrice, appliedFilters.guests]);

    const loadFilterOptions = async () => {
        try {
            const options = await getFilterOptions();
            setFilterOptions(options);
        } catch (error) {
            console.error('Error loading options:', error);
        }
    };

    const loadProperties = async () => {
        if (isInitialLoad.current) setLoading(true);

        try {
            const response = await searchProperties(appliedFilters);
            setProperties(response.data || []);
            setPagination(response.pagination);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
            isInitialLoad.current = false;
        }
    };

    const updateFilter = (key: keyof PropertySearchParams, value: any) => {
        const newFilters = { ...appliedFilters, [key]: value, page: 1 };
        setAppliedFilters(newFilters);
        updateUrl(newFilters);
    };

    const updateUrl = (filters: PropertySearchParams) => {
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([k, v]) => {
            if (v !== undefined && v !== null && v !== '') {
                params.set(k, v.toString());
            }
        });
        setSearchParams(params, { replace: true });
    };

    const applyDetailedFilters = () => {
        const min = draftFilters.minPrice ? Number(draftFilters.minPrice) : undefined;
        const max = draftFilters.maxPrice ? Number(draftFilters.maxPrice) : undefined;
        const g = draftFilters.guests ? Number(draftFilters.guests) : undefined;

        const newFilters = {
            ...appliedFilters,
            minPrice: min,
            maxPrice: max,
            guests: g,
            page: 1
        };
        setAppliedFilters(newFilters);
        updateUrl(newFilters);
    };

    const clearAllFilters = () => {
        const reset: PropertySearchParams = { page: 1, limit: 12, sortBy: 'newest' };
        setAppliedFilters(reset);
        setDraftFilters({ minPrice: '', maxPrice: '', guests: '' });
        setLocationQuery('');
        updateUrl(reset);
    };
    return (
        <div className="min-h-screen text-white overflow-x-hidden" style={{ background: '#0a0e27' }}>
            {/* Hero - Premium Luxury */}
            <section className="relative text-white pb-28 pt-16 sm:pb-32 sm:pt-20 md:pb-16 overflow-hidden" style={{ background: '#0a0e27' }}>
                {/* Abstract Background Elements */}
                <div className="absolute inset-0 opacity-40 pointer-events-none">
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 blur-3xl rounded-full" style={{ background: 'rgba(92,225,230,0.3)' }} />
                    <div className="absolute bottom-0 left-0 w-1/3 h-1/3 blur-3xl rounded-full" style={{ background: 'rgba(74,144,226,0.25)' }} />
                </div>

                <div className="container mx-auto px-6 sm:px-8 text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 tracking-tight">
                            Our Stays
                        </h1>
                        <p className="text-lg md:text-xl max-w-3xl mx-auto leading-relaxed">
                            Handpicked retreats where luxury meets nature. Your sanctuary awaits.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Desktop Filter Bar */}
            <div className="hidden md:block border-b" style={{ borderColor: 'rgba(92,225,230,0.1)', background: '#0a0e27' }}>
                <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        {/* Location Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#B0B7C3] pointer-events-none z-10" />
                            <input
                                type="text"
                                value={locationQuery}
                                onChange={(e) => setLocationQuery(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && locationQuery) {
                                        updateFilter('search', locationQuery);
                                        updateFilter('city', locationQuery);
                                    }
                                }}
                                placeholder="Search by city or location..."
                                className="w-full pl-12 pr-4 py-3.5 bg-[#1e2139] border-2 border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] text-sm font-medium transition-all text-white placeholder:text-[#B0B7C3]"
                            />
                            {locationQuery && (
                                <button
                                    onClick={() => {
                                        setLocationQuery('');
                                        updateFilter('search', undefined);
                                        updateFilter('city', undefined);
                                    }}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#0a0e27] rounded-lg transition-colors z-10"
                                    aria-label="Clear search"
                                >
                                    <X className="w-4 h-4 text-[#B0B7C3]" />
                                </button>
                            )}

                            {/* Desktop Location Suggestions */}
                            {locationQuery.length > 0 && locationSuggestions.length > 0 && (
                                <div className="absolute top-full mt-2 left-0 right-0 bg-[#1e2139] border-2 border-[#5ce1e6]/20 rounded-xl p-2 max-h-64 overflow-y-auto shadow-xl z-50">
                                    {locationSuggestions.map((loc, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setLocationQuery(loc.city);
                                                updateFilter('city', loc.city);
                                            }}
                                            className="w-full text-left px-3 py-2.5 hover:bg-[#0a0e27] rounded-lg flex items-center gap-3 transition-colors"
                                        >
                                            <div className="w-8 h-8 rounded-full bg-[#0a0e27] flex items-center justify-center shrink-0">
                                                <MapPin className="w-4 h-4 text-[#5CE1E6]" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="font-semibold text-white text-sm truncate">{loc.city}</div>
                                                <div className="text-xs text-[#B0B7C3]">{loc.state} · {loc.count} properties</div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Price Range Dropdown */}
                        <div className="relative price-dropdown">
                            <button
                                onClick={() => setIsPriceDropdownOpen(!isPriceDropdownOpen)}
                                className="px-4 py-3.5 bg-[#1e2139] border-2 border-[#5ce1e6]/20 rounded-xl hover:border-[#5ce1e6]/50 focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] transition-all text-white text-sm font-medium whitespace-nowrap min-w-[150px] flex items-center justify-between"
                            >
                                <span>
                                    {(appliedFilters.minPrice || appliedFilters.maxPrice)
                                        ? `₹${appliedFilters.minPrice || 0}-${appliedFilters.maxPrice || '∞'}`
                                        : 'Price Range'}
                                </span>
                                <svg
                                    className={`w-4 h-4 transition-transform ${isPriceDropdownOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="#5CE1E6"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Price Dropdown Panel */}
                            {isPriceDropdownOpen && (
                                <div className="absolute top-full mt-2 left-0 bg-[#1e2139]/80 backdrop-blur-xl border-2 border-[#5ce1e6]/30 rounded-2xl p-5 shadow-2xl z-50 w-80">
                                    <div className="space-y-4">
                                        <label className="text-xs font-bold text-white uppercase tracking-wider block mb-3">Price Range</label>

                                        <div className="space-y-4">
                                            <div className="relative">
                                                <label className="text-xs font-medium text-[#B0B7C3] mb-1.5 block">Minimum Price</label>
                                                <span className="absolute left-3 bottom-3 text-[#5CE1E6] text-sm font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    value={draftFilters.minPrice}
                                                    onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
                                                    placeholder="Enter minimum"
                                                    className="w-full pl-7 pr-4 py-3 bg-[#0a0e27]/50 backdrop-blur-sm border-2 border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] text-sm font-medium transition-all text-white placeholder:text-[#B0B7C3]/50"
                                                />
                                            </div>

                                            <div className="relative">
                                                <label className="text-xs font-medium text-[#B0B7C3] mb-1.5 block">Maximum Price</label>
                                                <span className="absolute left-3 bottom-3 text-[#5CE1E6] text-sm font-semibold">₹</span>
                                                <input
                                                    type="number"
                                                    value={draftFilters.maxPrice}
                                                    onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
                                                    placeholder="Enter maximum"
                                                    className="w-full pl-7 pr-4 py-3 bg-[#0a0e27]/50 backdrop-blur-sm border-2 border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] text-sm font-medium transition-all text-white placeholder:text-[#B0B7C3]/50"
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => {
                                                applyDetailedFilters();
                                                setIsPriceDropdownOpen(false);
                                            }}
                                            className="w-full px-5 py-3.5 rounded-xl font-semibold text-sm text-white transition-all hover:shadow-lg hover:shadow-[#5ce1e6]/20 active:scale-98"
                                            style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                                        >
                                            Apply Filters
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Property Type Filter */}
                        <div className="relative">
                            <select
                                value={appliedFilters.propertyType || ''}
                                onChange={(e) => updateFilter('propertyType', e.target.value || undefined)}
                                className="px-4 py-3.5 bg-[#1e2139] border-2 border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] appearance-none cursor-pointer transition-all text-white text-sm font-medium min-w-[150px] pr-10"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4,6L8,10L12,6' stroke='%235CE1E6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'center right 1rem', backgroundRepeat: 'no-repeat' }}
                                aria-label="Filter by property type"
                            >
                                <option value="">All Types</option>
                                {filterOptions?.propertyTypes?.map((type: string) => (
                                    <option key={type} value={type} className="capitalize">{type}</option>
                                ))}
                            </select>
                        </div>

                        {/* Guests Filter */}
                        <div className="relative">
                            <select
                                value={appliedFilters.guests || ''}
                                onChange={(e) => updateFilter('guests', e.target.value ? Number(e.target.value) : undefined)}
                                className="px-4 py-3.5 bg-[#1e2139] border-2 border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] appearance-none cursor-pointer transition-all text-white text-sm font-medium min-w-[130px] pr-10"
                                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='16' height='16' viewBox='0 0 16 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M4,6L8,10L12,6' stroke='%235CE1E6' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`, backgroundPosition: 'center right 1rem', backgroundRepeat: 'no-repeat' }}
                                aria-label="Filter by number of guests"
                            >
                                <option value="">Any Guests</option>
                                {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
                                    <option key={num} value={num}>{num} {num === 1 ? 'Guest' : 'Guests'}</option>
                                ))}
                            </select>
                        </div>

                        {/* Clear Filters */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={clearAllFilters}
                                className="px-4 py-3.5 rounded-xl font-medium text-sm text-white transition-all border-2 border-red-500/20 hover:bg-red-500/10"
                                style={{ background: 'rgba(239, 68, 68, 0.1)' }}
                            >
                                Clear ({activeFilterCount})
                            </button>
                        )}
                    </div>

                    {/* Active Filter Chips */}
                    {activeFilterCount > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-4">
                            <span className="text-xs font-medium text-[#B0B7C3]">Active filters:</span>
                            {appliedFilters.city && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2139] border border-[#5ce1e6]/20 text-xs font-medium text-white">
                                    <MapPin className="w-3 h-3 text-[#5CE1E6]" />
                                    {appliedFilters.city}
                                    <button onClick={() => updateFilter('city', undefined)} className="hover:text-red-400 transition-colors" aria-label="Remove location filter">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {(appliedFilters.minPrice || appliedFilters.maxPrice) && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2139] border border-[#5ce1e6]/20 text-xs font-medium text-white">
                                    ₹{appliedFilters.minPrice || 0}-{appliedFilters.maxPrice || '∞'}
                                    <button onClick={() => { updateFilter('minPrice', undefined); updateFilter('maxPrice', undefined); }} className="hover:text-red-400 transition-colors" aria-label="Remove price filter">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {appliedFilters.guests && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2139] border border-[#5ce1e6]/20 text-xs font-medium text-white">
                                    {appliedFilters.guests} Guests
                                    <button onClick={() => updateFilter('guests', undefined)} className="hover:text-red-400 transition-colors" aria-label="Remove guests filter">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                            {appliedFilters.propertyType && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#1e2139] border border-[#5ce1e6]/20 text-xs font-medium text-white capitalize">
                                    {appliedFilters.propertyType}
                                    <button onClick={() => updateFilter('propertyType', undefined)} className="hover:text-red-400 transition-colors" aria-label="Remove property type filter">
                                        <X className="w-3 h-3" />
                                    </button>
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Filter Button - Overlapping */}
            <div className="md:hidden container mx-auto px-4 -mt-14 sm:-mt-16 relative z-20 mb-8">
                <motion.button
                    onClick={() => setIsMobileFilterOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full rounded-2xl px-5 py-4 flex items-center justify-between shadow-lg border transition-all"
                    style={{ background: '#1e2139', borderColor: 'rgba(92,225,230,0.2)', boxShadow: '0 12px 28px rgba(0,0,0,0.4)' }}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                            <Search className="w-5 h-5 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-sm font-bold text-white">
                                {locationQuery || appliedFilters.propertyType || appliedFilters.guests
                                    ? 'Filters Applied'
                                    : 'Search & Filter'}
                            </div>
                            <div className="text-xs font-medium" style={{ color: '#B0B7C3' }}>
                                {activeFilterCount > 0
                                    ? `${activeFilterCount} active • ${properties.length} properties`
                                    : `${properties.length} ${properties.length === 1 ? 'property' : 'properties'}`
                                }
                            </div>
                        </div>
                    </div>
                    <SlidersHorizontal className="w-6 h-6" style={{ color: '#B0B7C3' }} />
                </motion.button>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-6 pb-20 max-w-7xl mt-10 md:mt-14">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl" style={{ background: '#1e2139' }}>🏚️</div>
                        <h3 className="text-xlf font-semibold text-white mb-2">No properties found</h3>
                        <p className="mb-6" style={{ color: '#B0B7C3' }}>Try slightly fewer filters to see more results.</p>
                        <button
                            onClick={clearAllFilters}
                            className="px-6 py-2.5 rounded-xl font-medium text-white transition-all border border-[#5ce1e6]/20 hover:bg-[#1e2139]"
                            style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                        >
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <AnimatePresence mode="popLayout">
                                {properties.map((property, idx) => (
                                    <motion.div
                                        key={property._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                                    >
                                        <PropertyCard property={property} />
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* Pagination */}
                        {pagination && pagination.totalPages > 1 && (
                            <div className="flex justify-center items-center gap-4 mt-16">
                                <button
                                    onClick={() => updateFilter('page', Math.max(1, (appliedFilters.page || 1) - 1))}
                                    disabled={!pagination.hasMore || (appliedFilters.page || 1) === 1}
                                    className="px-5 py-2.5 rounded-full border border-[#5ce1e6]/20 hover:bg-[#1e2139] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors text-white"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-[#B0B7C3]">
                                    Page {appliedFilters.page || 1} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => updateFilter('page', (appliedFilters.page || 1) + 1)}
                                    disabled={!pagination.hasMore}
                                    className="px-5 py-2.5 rounded-full border border-[#5ce1e6]/20 hover:bg-[#1e2139] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors text-white"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Mobile Filter Dropdown (Centered Modal style) */}
            {
                createPortal(
                    <AnimatePresence>
                        {isMobileFilterOpen && (
                            <>
                                {/* Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-9998 md:hidden"
                                />

                                {/* Premium Dropdown Panel */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="fixed top-24 left-4 right-4 z-9999 md:hidden max-w-md mx-auto"
                                >
                                    <div className="bg-[#1e2139] backdrop-blur-xl rounded-3xl border border-[#5ce1e6]/20 overflow-hidden max-h-[calc(100vh-120px)] flex flex-col" style={{ boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}>
                                        {/* Compact Header */}
                                        <div className="px-5 py-4 flex items-center justify-between shrink-0 border-b border-[#5ce1e6]/10" style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}>
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <Search className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base font-bold text-white">Search & Filter</h3>
                                            </div>
                                            <button
                                                onClick={() => setIsMobileFilterOpen(false)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                aria-label="Close filters"
                                            >
                                                <X className="w-4 h-4 text-white/80" />
                                            </button>
                                        </div>

                                        {/* Scrollable Filter Content */}
                                        <div className="p-4 space-y-4 overflow-y-auto flex-1">
                                            {/* Location Search */}
                                            <div>
                                                <label className="text-[10px] font-bold text-[#B0B7C3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-[#5CE1E6]"></div>
                                                    Search Location
                                                </label>
                                                <div className="relative">
                                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#B0B7C3] z-10" />
                                                    <input
                                                        type="text"
                                                        value={locationQuery}
                                                        onChange={(e) => setLocationQuery(e.target.value)}
                                                        placeholder="Where would you like to go?"
                                                        className="w-full pl-10 pr-3 py-3 bg-[#0a0e27] border-2 border-[#5ce1e6]/20 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 focus:border-[#5ce1e6] text-sm font-semibold transition-all text-white placeholder:text-[#B0B7C3]"
                                                    />
                                                    {locationQuery && (
                                                        <button
                                                            onClick={() => {
                                                                setLocationQuery('');
                                                                updateFilter('search', undefined);
                                                                updateFilter('city', undefined);
                                                            }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 rounded-full transition-colors z-10"
                                                            aria-label="Clear location"
                                                        >
                                                            <X className="w-4 h-4 text-gray-500" />
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Location Suggestions */}
                                                {locationQuery.length > 0 && locationSuggestions.length > 0 && (
                                                    <div className="mt-2 bg-[#0a0e27] border-2 border-[#5ce1e6]/20 rounded-2xl p-2 max-h-48 overflow-y-auto">
                                                        {locationSuggestions.map((loc, i) => (
                                                            <button
                                                                key={i}
                                                                onClick={() => {
                                                                    setLocationQuery(loc.city);
                                                                    updateFilter('city', loc.city);
                                                                }}
                                                                className="w-full text-left px-3 py-2.5 hover:bg-[#1e2139] rounded-xl flex items-center gap-3 transition-colors"
                                                            >
                                                                <div className="w-8 h-8 rounded-full bg-[#1e2139] flex items-center justify-center shrink-0">
                                                                    <MapPin className="w-4 h-4 text-[#5CE1E6]" />
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <div className="font-semibold text-white text-sm truncate">{loc.city}</div>
                                                                    <div className="text-xs text-[#B0B7C3]">{loc.state}</div>
                                                                </div>
                                                            </button>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>

                                            {/* Price Range */}
                                            <div>
                                                <label className="text-[10px] font-bold text-[#B0B7C3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-[#5CE1E6]"></div>
                                                    Price Range
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B7C3] text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={draftFilters.minPrice}
                                                            onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
                                                            placeholder="Min"
                                                            className="w-full pl-6 pr-2 py-2.5 bg-[#0a0e27] border border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 text-sm font-medium transition-all text-white placeholder:text-[#B0B7C3]"
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B0B7C3] text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={draftFilters.maxPrice}
                                                            onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
                                                            placeholder="Max"
                                                            className="w-full pl-6 pr-2 py-2.5 bg-[#0a0e27] border border-[#5ce1e6]/20 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5ce1e6]/50 text-sm font-medium transition-all text-white placeholder:text-[#B0B7C3]"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Property Type */}
                                            <div>
                                                <label className="text-[10px] font-bold text-[#B0B7C3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-[#5CE1E6]"></div>
                                                    Type
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => updateFilter('propertyType', undefined)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${!appliedFilters.propertyType
                                                            ? 'bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] text-white shadow-lg'
                                                            : 'bg-[#0a0e27] border border-[#5ce1e6]/20 text-[#B0B7C3] hover:border-[#5ce1e6]/50 hover:bg-[#1e2139]'
                                                            }`}
                                                    >
                                                        All
                                                    </button>
                                                    {filterOptions?.propertyTypes?.map((type: string) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => updateFilter('propertyType', type)}
                                                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${appliedFilters.propertyType === type
                                                                ? 'bg-linear-to-br from-[#3d9da3] to-[#2d6b9e] text-white shadow-lg'
                                                                : 'bg-[#0a0e27] border border-[#5ce1e6]/20 text-[#B0B7C3] hover:border-[#5ce1e6]/50 hover:bg-[#1e2139]'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Guests */}
                                            <div>
                                                <label className="text-[10px] font-bold text-[#B0B7C3] mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-[#5CE1E6]"></div>
                                                    Guests
                                                </label>
                                                <div className="flex items-center justify-between p-3 bg-[#0a0e27] rounded-xl border border-[#5ce1e6]/20">
                                                    <span className="text-sm font-medium text-white">Count</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setDraftFilters(p => ({ ...p, guests: Math.max(1, (Number(p.guests) || 1) - 1).toString() }))}
                                                            className="w-8 h-8 rounded-lg bg-[#1e2139] border border-[#5ce1e6]/20 text-white flex items-center justify-center hover:bg-[#2a2f4a] active:scale-95 transition-all"
                                                        >-</button>
                                                        <span className="w-6 text-center font-bold text-white">{draftFilters.guests || 1}</span>
                                                        <button
                                                            onClick={() => setDraftFilters(p => ({ ...p, guests: ((Number(p.guests) || 1) + 1).toString() }))}
                                                            className="w-8 h-8 rounded-lg bg-[#1e2139] border border-[#5ce1e6]/20 text-white flex items-center justify-center hover:bg-[#2a2f4a] active:scale-95 transition-all"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-4 bg-[#0a0e27] border-t border-[#5ce1e6]/10 flex gap-2 shrink-0">
                                            <button
                                                onClick={() => {
                                                    clearAllFilters();
                                                    setLocationQuery('');
                                                }}
                                                className="flex-1 px-4 py-3 rounded-2xl text-xs font-bold text-white bg-[#1e2139] hover:bg-[#2a2f4a] transition-colors border-2 border-[#5ce1e6]/20 flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                Reset All
                                            </button>
                                            <button
                                                onClick={() => {
                                                    if (locationQuery) {
                                                        updateFilter('search', locationQuery);
                                                    }
                                                    applyDetailedFilters();
                                                    setIsMobileFilterOpen(false);
                                                }}
                                                className="flex-2 px-6 py-3 text-white text-xs font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                                                style={{ background: 'linear-gradient(135deg, #3d9da3 0%, #2d6b9e 100%)' }}
                                            >
                                                <Check className="w-4 h-4" />
                                                Apply Filters ({pagination?.total || properties.length})
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )
            }
        </div >
    );
}
