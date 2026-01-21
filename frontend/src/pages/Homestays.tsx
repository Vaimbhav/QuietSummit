import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    X, Loader2, MapPin,
    Search, SlidersHorizontal, Check, ChevronDown
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
    const [activeFilter, setActiveFilter] = useState<string | null>(null);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);
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
    const [loadingLocation, setLoadingLocation] = useState(false);

    // Determine active filter count
    const activeFilterCount = [
        appliedFilters.minPrice || appliedFilters.maxPrice,
        appliedFilters.guests,
        appliedFilters.bedrooms,
        appliedFilters.propertyType,
        appliedFilters.city
    ].filter(Boolean).length;

    // Property type options
    const typeOptions = ['Villa', 'Cabin', 'Cottage', 'Farmhouse', 'Treehouse', 'Other'];

    useEffect(() => {
        loadFilterOptions();

        // Click outside to close filters
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            // Don't close if clicking inside the filter dropdown itself
            const isClickInsideDropdown = (target as HTMLElement).closest('.filter-dropdown-content');

            if (filterRef.current && !filterRef.current.contains(target) && !isClickInsideDropdown) {
                setActiveFilter(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch location suggestions
    useEffect(() => {
        const fetchLocationSuggestions = async () => {
            if (locationQuery.length < 1) {
                setLocationSuggestions([]);
                return;
            }
            setLoadingLocation(true);
            try {
                const response = await getLocationSuggestions(locationQuery);
                setLocationSuggestions(response.suggestions || []);
            } catch (error) {
                console.error('Error:', error);
            } finally {
                setLoadingLocation(false);
            }
        };
        const timeoutId = setTimeout(fetchLocationSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [locationQuery]);

    useEffect(() => {
        loadProperties();
    }, [appliedFilters]);

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
        setActiveFilter(null);
    };

    const clearAllFilters = () => {
        const reset: PropertySearchParams = { page: 1, limit: 12, sortBy: 'newest' };
        setAppliedFilters(reset);
        setDraftFilters({ minPrice: '', maxPrice: '', guests: '' });
        setLocationQuery('');
        updateUrl(reset);
    };

    // Render Filter Popover Helper
    const FilterPopover = ({ title, isActive, onClose, children }: { title: string, isActive: boolean, onClose: () => void, children: React.ReactNode }) => (
        <AnimatePresence>
            {isActive && (
                <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 left-0 w-80 bg-white rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] border border-gray-100 p-6 z-50 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-gray-900">{title}</h3>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                    {children}
                    <div className="mt-6 pt-4 border-t border-gray-50 flex justify-end gap-2">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={applyDetailedFilters}
                            className="px-4 py-2 text-sm font-medium bg-black text-white rounded-lg hover:bg-gray-800"
                        >
                            Apply
                        </button>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    return (
        <div className="min-h-screen bg-[#FAF9F7] text-neutral-900 font-sans">
            {/* Hero - Premium Simplified */}
            <section className="relative bg-primary-600 text-white py-20 sm:py-24">
                <div className="container mx-auto px-6 sm:px-8 text-center relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6"
                    >
                        Find your sanctuary.
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl max-w-2xl mx-auto leading-relaxed mb-8"
                    >
                        Curated homestays for the conscious traveler.
                    </motion.p>

                    {/* Premium Search Bar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="max-w-4xl mx-auto relative px-4 sm:px-0 z-50"
                        ref={filterRef}
                    >
                        <div className="bg-white/95 backdrop-blur-xl rounded-full shadow-2xl p-2 flex items-center gap-2 border border-white/20">
                            <div className="flex-1 flex items-center gap-2 pl-4 pr-1 min-w-0">
                                <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                                <input
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => {
                                        setLocationQuery(e.target.value);
                                        setActiveFilter('location');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            updateFilter('search', locationQuery);
                                            setActiveFilter(null);
                                        }
                                    }}
                                    onClick={() => setActiveFilter('location')}
                                    placeholder="Where to?"
                                    className="flex-1 bg-transparent border-none focus:ring-0 focus:outline-none text-gray-900 placeholder:text-gray-400 font-medium text-base sm:text-lg py-3 min-w-0 w-0"
                                />
                            </div>
                            {locationQuery && (
                                <button
                                    onClick={() => {
                                        setLocationQuery('');
                                        updateFilter('search', undefined);
                                        updateFilter('city', undefined);
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0 mr-1"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            )}

                            {/* Dividers */}
                            <div className="hidden md:block w-px h-10 bg-gray-200"></div>

                            <div className="hidden md:flex items-center gap-1">
                                {/* Price Filter */}
                                <button
                                    onClick={() => {
                                        if (activeFilter !== 'price') {
                                            setDraftFilters(prev => ({
                                                ...prev,
                                                minPrice: appliedFilters.minPrice ? String(appliedFilters.minPrice) : '',
                                                maxPrice: appliedFilters.maxPrice ? String(appliedFilters.maxPrice) : ''
                                            }));
                                            setActiveFilter('price');
                                        } else {
                                            setActiveFilter(null);
                                        }
                                    }}
                                    className={`px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm ${activeFilter === 'price'
                                        ? 'border-blue-500 bg-blue-50 text-gray-900'
                                        : (appliedFilters.minPrice || appliedFilters.maxPrice)
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {(appliedFilters.minPrice || appliedFilters.maxPrice)
                                        ? `₹${appliedFilters.minPrice || 0}-${appliedFilters.maxPrice || '∞'}`
                                        : 'Price'
                                    }
                                </button>

                                {/* Type Filter */}
                                <button
                                    onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
                                    className={`px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm ${activeFilter === 'type'
                                        ? 'border-blue-500 bg-blue-50 text-gray-900'
                                        : appliedFilters.propertyType
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {appliedFilters.propertyType || 'Type'}
                                </button>

                                {/* Guests Filter */}
                                <button
                                    onClick={() => {
                                        if (activeFilter !== 'guests') {
                                            setDraftFilters(prev => ({
                                                ...prev,
                                                guests: appliedFilters.guests ? String(appliedFilters.guests) : '1'
                                            }));
                                            setActiveFilter('guests');
                                        } else {
                                            setActiveFilter(null);
                                        }
                                    }}
                                    className={`px-4 py-2.5 rounded-xl border-2 transition-all font-medium text-sm ${activeFilter === 'guests'
                                        ? 'border-blue-500 bg-blue-50 text-gray-900'
                                        : appliedFilters.guests
                                            ? 'border-gray-900 bg-gray-900 text-white'
                                            : 'border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {appliedFilters.guests || 'Guests'}
                                </button>
                            </div>

                            {/* Divider */}
                            <div className="flex-none">
                                <button className="bg-primary-600 hover:bg-primary-700 text-white w-10 h-10 sm:w-auto sm:h-auto p-0 sm:px-8 sm:py-4 rounded-full font-semibold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 flex-shrink-0">
                                    <Search className="w-5 h-5" />
                                    <span className="hidden sm:inline">Search</span>
                                </button>
                            </div>
                        </div>     {/* Filter Dropdowns */}
                        <AnimatePresence>
                            {activeFilter === 'price' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="filter-dropdown-content absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-80 z-50"
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Min Price</label>
                                            <input
                                                type="number"
                                                value={draftFilters.minPrice || ''}
                                                onChange={(e) => setDraftFilters(p => ({ ...p, minPrice: e.target.value }))}
                                                placeholder="₹500"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-2">Max Price</label>
                                            <input
                                                type="number"
                                                value={draftFilters.maxPrice || ''}
                                                onChange={(e) => setDraftFilters(p => ({ ...p, maxPrice: e.target.value }))}
                                                placeholder="₹5000"
                                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                                            />
                                        </div>
                                        <button
                                            onClick={() => {
                                                applyDetailedFilters();
                                                setActiveFilter(null);
                                            }}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </motion.div>
                            )}

                            {activeFilter === 'type' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="filter-dropdown-content absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-64 z-50"
                                >
                                    <div className="space-y-2">
                                        {typeOptions.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => {
                                                    updateFilter('propertyType', type);
                                                    setActiveFilter(null);
                                                }}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-medium border-2 ${appliedFilters.propertyType === type
                                                    ? 'bg-primary-50 text-primary-700 border-primary-500'
                                                    : 'hover:bg-gray-50 text-gray-700 border-transparent hover:border-gray-300'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            {activeFilter === 'guests' && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="filter-dropdown-content absolute top-full mt-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-6 w-64 z-50"
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700 font-semibold">Guests</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setDraftFilters(p => ({ ...p, guests: Math.max(1, (Number(p.guests) || 1) - 1).toString() }))}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium text-gray-700"
                                                >−</button>
                                                <span className="w-12 text-center font-bold text-lg text-gray-900">{draftFilters.guests || 1}</span>
                                                <button
                                                    onClick={() => setDraftFilters(p => ({ ...p, guests: ((Number(p.guests) || 1) + 1).toString() }))}
                                                    className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-50 font-medium text-gray-700"
                                                >+</button>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                applyDetailedFilters();
                                                setActiveFilter(null);
                                            }}
                                            className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 rounded-xl font-semibold transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                </div>

                {/* Bottom wave effect */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 120" className="w-full h-12 fill-[#FAF9F7]">
                        <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z"></path>
                    </svg>
                </div>
            </section>

            {/* Mobile Filter Button - Overlapping */}
            <div className="md:hidden container mx-auto px-6 -mt-16 sm:-mt-20 relative z-20 mb-6">
                <motion.button
                    onClick={() => setIsMobileFilterOpen(true)}
                    whileTap={{ scale: 0.98 }}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full bg-white rounded-2xl px-6 py-5 flex items-center justify-between shadow-lg border border-neutral-200 hover:shadow-xl transition-all"
                >
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center shadow-sm">
                            <SlidersHorizontal className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-left">
                            <div className="text-base font-bold text-neutral-900">Filters</div>
                            <div className="text-sm text-neutral-600 font-medium">{properties.length} {properties.length === 1 ? 'property' : 'properties'}</div>
                        </div>
                    </div>
                    <ChevronDown className="w-6 h-6 text-neutral-600" />
                </motion.button>
            </div>

            {/* Sticky Filter Bar - HIDDEN (search now in hero) */}
            <div style={{ display: 'none' }}>
                <div className="max-w-6xl mx-auto">
                    <div className="bg-white/90 backdrop-blur-xl border border-gray-200/50 shadow-sm rounded-full p-2 flex items-center justify-between gap-2 overflow-visible transition-all hover:shadow-md">

                        {/* Mobile Filter Toggle */}
                        <button
                            onClick={() => setIsMobileFilterOpen(true)}
                            className="md:hidden p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 text-gray-700"
                        >
                            <SlidersHorizontal className="w-5 h-5" />
                        </button>

                        {/* Location Search - The "Input" */}
                        <div className="relative flex-1 group">
                            <div className="flex items-center pl-4 pr-2 gap-3">
                                <Search className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors" />
                                <input
                                    type="text"
                                    value={locationQuery}
                                    onChange={(e) => {
                                        setLocationQuery(e.target.value);
                                        setActiveFilter('location');
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            updateFilter('search', locationQuery);
                                            setActiveFilter(null);
                                        }
                                    }}
                                    onClick={() => setActiveFilter('location')}
                                    placeholder="Where to?"
                                    className="w-full bg-transparent border-none focus:ring-0 focus:outline-none outline-none text-gray-900 placeholder:text-gray-400 font-medium h-10 p-0"
                                />
                                {locationQuery && (
                                    <button
                                        onClick={() => {
                                            setLocationQuery('');
                                            updateFilter('search', undefined);
                                            updateFilter('city', undefined);
                                        }}
                                        className="p-1 hover:bg-gray-100 rounded-full"
                                    >
                                        <X className="w-4 h-4 text-gray-400" />
                                    </button>
                                )}
                            </div>

                            <AnimatePresence>
                                {activeFilter === 'location' && (locationSuggestions.length > 0 || loadingLocation) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                        animate={{ opacity: 1, y: 0, scale: 1 }}
                                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                        className="absolute top-full left-0 mt-4 w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 overflow-hidden z-50 origin-top-left"
                                    >
                                        {loadingLocation ? (
                                            <div className="p-4 flex items-center gap-2 text-gray-500">
                                                <Loader2 className="w-4 h-4 animate-spin" /> Looking...
                                            </div>
                                        ) : (
                                            locationSuggestions.map((loc, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => {
                                                        setLocationQuery(loc.city);
                                                        updateFilter('city', loc.city);
                                                        setActiveFilter(null);
                                                    }}
                                                    className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-xl flex items-center gap-3 transition-colors"
                                                >
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                                                        <MapPin className="w-4 h-4 text-gray-600" />
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{loc.city}</div>
                                                        <div className="text-xs text-gray-500">{loc.state}</div>
                                                    </div>
                                                </button>
                                            ))
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Divider */}
                        <div className="w-px h-8 bg-gray-200 hidden md:block" />

                        {/* Filter Pills */}
                        <div className="hidden md:flex items-center gap-2">

                            {/* Price Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveFilter(activeFilter === 'price' ? null : 'price')}
                                    className={`h-10 px-4 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${(appliedFilters.minPrice || appliedFilters.maxPrice)
                                        ? 'border-black bg-black text-white hover:bg-gray-800'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                        }`}
                                >
                                    Price
                                    {(appliedFilters.minPrice || appliedFilters.maxPrice) && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <FilterPopover
                                    title="Price Range"
                                    isActive={activeFilter === 'price'}
                                    onClose={() => setActiveFilter(null)}
                                >
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Min Price</label>
                                            <div className="relative mt-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                <input
                                                    type="number"
                                                    value={draftFilters.minPrice}
                                                    onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
                                                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-black focus:border-black"
                                                    placeholder="0"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-gray-500 uppercase">Max Price</label>
                                            <div className="relative mt-1">
                                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₹</span>
                                                <input
                                                    type="number"
                                                    value={draftFilters.maxPrice}
                                                    onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
                                                    className="w-full pl-7 pr-3 py-2 border rounded-lg focus:ring-black focus:border-black"
                                                    placeholder="Any"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </FilterPopover>
                            </div>

                            {/* Type Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveFilter(activeFilter === 'type' ? null : 'type')}
                                    className={`h-10 px-4 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${appliedFilters.propertyType
                                        ? 'border-black bg-black text-white hover:bg-gray-800'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                        }`}
                                >
                                    Type
                                    {appliedFilters.propertyType && <Check className="w-3.5 h-3.5" />}
                                </button>
                                <AnimatePresence>
                                    {activeFilter === 'type' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute top-full mt-2 left-0 w-64 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50"
                                        >
                                            <button
                                                onClick={() => { updateFilter('propertyType', undefined); setActiveFilter(null); }}
                                                className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${!appliedFilters.propertyType ? 'bg-gray-100 font-medium' : 'hover:bg-gray-50'}`}
                                            >
                                                All Types
                                            </button>
                                            {filterOptions?.propertyTypes?.map((type: string) => (
                                                <button
                                                    key={type}
                                                    onClick={() => { updateFilter('propertyType', type); setActiveFilter(null); }}
                                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm capitalize ${appliedFilters.propertyType === type ? 'bg-black text-white font-medium' : 'text-gray-700 hover:bg-gray-50'}`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>

                            {/* Guests Filter */}
                            <div className="relative">
                                <button
                                    onClick={() => setActiveFilter(activeFilter === 'guests' ? null : 'guests')}
                                    className={`h-10 px-4 rounded-full border transition-all text-sm font-medium flex items-center gap-2 ${appliedFilters.guests
                                        ? 'border-black bg-black text-white hover:bg-gray-800'
                                        : 'border-gray-200 hover:border-gray-300 text-gray-700 bg-white'
                                        }`}
                                >
                                    Guests
                                    {appliedFilters.guests && <span className="bg-white/20 px-1.5 rounded text-xs">{appliedFilters.guests}</span>}
                                </button>
                                <FilterPopover
                                    title="Guests"
                                    isActive={activeFilter === 'guests'}
                                    onClose={() => setActiveFilter(null)}
                                >
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-gray-700 font-medium">Guests</span>
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={() => setDraftFilters(p => ({ ...p, guests: Math.max(1, (Number(p.guests) || 1) - 1).toString() }))}
                                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                                >-</button>
                                                <span className="w-4 text-center">{draftFilters.guests || 1}</span>
                                                <button
                                                    onClick={() => setDraftFilters(p => ({ ...p, guests: ((Number(p.guests) || 1) + 1).toString() }))}
                                                    className="w-8 h-8 rounded-full border flex items-center justify-center hover:bg-gray-50"
                                                >+</button>
                                            </div>
                                        </div>
                                    </div>
                                </FilterPopover>
                            </div>

                            {/* More Filters (Placeholder for Bed/Bath) */}
                            {/* <button className="h-10 w-10 rounded-full border border-gray-200 flex items-center justify-center hover:border-black transition-colors">
                                 <SlidersHorizontal className="w-4 h-4" />
                             </button> */}
                        </div>

                        {/* Search Action */}
                        <button
                            onClick={() => setActiveFilter(null)}
                            className="h-10 w-10 md:w-auto md:px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-full flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-lg shadow-primary-600/20"
                        >
                            <Search className="w-4 h-4" />
                            <span className="hidden md:inline font-medium">Search</span>
                        </button>
                    </div>

                    {/* Active Filters Summary (Chips) */}
                    {activeFilterCount > 0 && (
                        <div className="mt-4 flex flex-wrap gap-2 justify-center">
                            {appliedFilters.minPrice && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                                    Min: ₹{appliedFilters.minPrice}
                                    <button onClick={() => updateFilter('minPrice', undefined)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                </span>
                            )}
                            {appliedFilters.maxPrice && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                                    Max: ₹{appliedFilters.maxPrice}
                                    <button onClick={() => updateFilter('maxPrice', undefined)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                </span>
                            )}
                            {appliedFilters.propertyType && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-xs font-medium text-gray-800 capitalize">
                                    {appliedFilters.propertyType}
                                    <button onClick={() => updateFilter('propertyType', undefined)}><X className="w-3 h-3 hover:text-red-500" /></button>
                                </span>
                            )}
                            <button onClick={clearAllFilters} className="text-xs text-gray-500 hover:text-black underline">Clear all</button>
                        </div>
                    )}
                </div>
            </div>

            {/* Results Grid */}
            <div className="container mx-auto px-4 pb-20 max-w-7xl mt-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader />
                    </div>
                ) : properties.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">🏚️</div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
                        <p className="text-gray-500 mb-6">Try slightly fewer filters to see more results.</p>
                        <button onClick={clearAllFilters} className="px-6 py-2.5 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors">
                            Clear all filters
                        </button>
                    </div>
                ) : (
                    <>
                        <motion.div
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
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
                                        <PropertyCard property={property} onWishlistChange={loadProperties} />
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
                                    className="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-gray-600">
                                    Page {appliedFilters.page || 1} of {pagination.totalPages}
                                </span>
                                <button
                                    onClick={() => updateFilter('page', (appliedFilters.page || 1) + 1)}
                                    disabled={!pagination.hasMore}
                                    className="px-5 py-2.5 rounded-full border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
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
                                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[9998] md:hidden"
                                />

                                {/* Premium Dropdown Panel */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -20, scale: 0.95 }}
                                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                                    className="fixed top-32 left-4 right-4 z-[9999] md:hidden max-w-md mx-auto"
                                >
                                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] border border-neutral-200/50 overflow-hidden">
                                        {/* Compact Header */}
                                        <div className="bg-gradient-to-r from-neutral-900 to-neutral-800 px-5 py-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                                    <SlidersHorizontal className="w-4 h-4 text-white" />
                                                </div>
                                                <h3 className="text-base font-bold text-white">Filter & Sort</h3>
                                            </div>
                                            <button
                                                onClick={() => setIsMobileFilterOpen(false)}
                                                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                                                aria-label="Close filters"
                                            >
                                                <X className="w-4 h-4 text-white/80" />
                                            </button>
                                        </div>

                                        {/* Compact Filter Content */}
                                        <div className="p-4 space-y-4 max-h-[65vh] overflow-y-auto">
                                            {/* Price Range */}
                                            <div>
                                                <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                    Price Range
                                                </label>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={draftFilters.minPrice}
                                                            onChange={(e) => setDraftFilters({ ...draftFilters, minPrice: e.target.value })}
                                                            placeholder="Min"
                                                            className="w-full pl-6 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium transition-all"
                                                        />
                                                    </div>
                                                    <div className="flex-1 relative">
                                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">₹</span>
                                                        <input
                                                            type="number"
                                                            value={draftFilters.maxPrice}
                                                            onChange={(e) => setDraftFilters({ ...draftFilters, maxPrice: e.target.value })}
                                                            placeholder="Max"
                                                            className="w-full pl-6 pr-2 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 text-sm font-medium transition-all"
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Property Type */}
                                            <div>
                                                <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                    Type
                                                </label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    <button
                                                        onClick={() => updateFilter('propertyType', undefined)}
                                                        className={`px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 ${!appliedFilters.propertyType
                                                            ? 'bg-neutral-900 text-white shadow-lg'
                                                            : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                                                            }`}
                                                    >
                                                        All
                                                    </button>
                                                    {filterOptions?.propertyTypes?.map((type: string) => (
                                                        <button
                                                            key={type}
                                                            onClick={() => updateFilter('propertyType', type)}
                                                            className={`px-3 py-2 rounded-xl text-xs font-semibold capitalize transition-all duration-200 ${appliedFilters.propertyType === type
                                                                ? 'bg-neutral-900 text-white shadow-lg'
                                                                : 'bg-neutral-50 border border-neutral-200 text-neutral-700 hover:border-neutral-300 hover:bg-neutral-100'
                                                                }`}
                                                        >
                                                            {type}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Guests */}
                                            <div>
                                                <label className="text-[10px] font-bold text-neutral-600 mb-2 uppercase tracking-wider flex items-center gap-1.5">
                                                    <div className="w-1 h-1 rounded-full bg-primary-500"></div>
                                                    Guests
                                                </label>
                                                <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                                                    <span className="text-sm font-medium text-neutral-700">Count</span>
                                                    <div className="flex items-center gap-3">
                                                        <button
                                                            onClick={() => setDraftFilters(p => ({ ...p, guests: Math.max(1, (Number(p.guests) || 1) - 1).toString() }))}
                                                            className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
                                                        >-</button>
                                                        <span className="w-6 text-center font-bold text-neutral-900">{draftFilters.guests || 1}</span>
                                                        <button
                                                            onClick={() => setDraftFilters(p => ({ ...p, guests: ((Number(p.guests) || 1) + 1).toString() }))}
                                                            className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-neutral-100 active:scale-95 transition-all"
                                                        >+</button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Footer Actions */}
                                        <div className="p-4 bg-gray-50 border-t border-gray-100 flex gap-2">
                                            <button
                                                onClick={clearAllFilters}
                                                className="flex-1 px-4 py-3 rounded-xl text-xs font-bold text-neutral-700 bg-white hover:bg-neutral-100 transition-colors border border-gray-200"
                                            >
                                                Reset
                                            </button>
                                            <button
                                                onClick={() => { applyDetailedFilters(); setIsMobileFilterOpen(false); }}
                                                className="flex-[2] px-6 py-3 bg-gradient-to-r from-primary-600 to-blue-600 text-white text-xs font-bold rounded-xl shadow-lg hover:shadow-xl transition-all active:scale-95"
                                            >
                                                Apply ({pagination?.total})
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
