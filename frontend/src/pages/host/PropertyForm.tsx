import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createProperty, updateProperty, CreatePropertyData } from '@/services/hostApi';
import { Upload, X, MapPin, Home, DollarSign, Users, Wifi, Car, Utensils, Tv, Wind, Waves, Mountain, Coffee, Dumbbell, Save, ArrowLeft } from 'lucide-react';
import Loader from '@components/common/Loader';
import api from '@/services/api';
import { useToast } from '@/components/common/ToastProvider';

const AMENITIES_OPTIONS = [
    { id: 'wifi', label: 'WiFi', icon: Wifi },
    { id: 'parking', label: 'Free Parking', icon: Car },
    { id: 'kitchen', label: 'Kitchen', icon: Utensils },
    { id: 'tv', label: 'TV', icon: Tv },
    { id: 'ac', label: 'Air Conditioning', icon: Wind },
    { id: 'pool', label: 'Pool', icon: Waves },
    { id: 'mountain_view', label: 'Mountain View', icon: Mountain },
    { id: 'workspace', label: 'Dedicated Workspace', icon: Coffee },
    { id: 'gym', label: 'Gym', icon: Dumbbell },
];

const PROPERTY_TYPES = [
    'Entire Home',
    'Private Room',
    'Shared Room',
    'Cottage',
    'Villa',
    'Apartment',
    'Farmhouse',
    'Treehouse',
];

const CANCELLATION_POLICIES = [
    { value: 'flexible', label: 'Flexible - Full refund up to 24 hours before check-in' },
    { value: 'moderate', label: 'Moderate - Full refund up to 5 days before check-in' },
    { value: 'strict', label: 'Strict - 50% refund up to 7 days before check-in' },
    { value: 'super_strict', label: 'Super Strict - No refunds' },
];

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
    "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh",
    "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Lakshadweep", "Puducherry",
    "Ladakh", "Jammu and Kashmir"
];

export default function PropertyForm() {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const { showWarning, showError } = useToast();

    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [, setError] = useState<string | null>(null);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files?.length) return;

        const formData = new FormData();
        Array.from(e.target.files).forEach(file => {
            formData.append('images', file);
        });
        formData.append('folder', 'quietsummit/properties');

        setUploading(true);
        try {
            const response = await api.post('/upload/multiple', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            const newImages = response.data.data.map((img: any) => img.url);

            setImageUrls(prev => [...prev, ...newImages]);
            setFormData(prev => ({
                ...prev,
                images: [
                    ...(prev.images || []),
                    ...newImages.map((url: string) => ({
                        url,
                        isPrimary: (prev.images?.length || 0) === 0 && newImages.indexOf(url) === 0
                    }))
                ],
            }));
        } catch (error) {
            console.error('Upload failed', error);
            showError('Failed to upload images. Please try again.');
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const [formData, setFormData] = useState<Partial<CreatePropertyData>>({
        title: '',
        description: '',
        propertyType: 'Entire Home',
        address: {
            street: '',
            city: '',
            state: '',
            country: 'India',
            postalCode: '',
        },
        capacity: {
            guests: 2,
            bedrooms: 1,
            beds: 1,
            bathrooms: 1,
        },
        amenities: [],
        images: [],
        pricing: {
            basePrice: 0,
            weekendPrice: 0,
            cleaningFee: 0,
            securityDeposit: 0,
        },
        houseRules: {
            checkIn: '14:00',
            checkOut: '11:00',
            smoking: false,
            pets: false,
            parties: false,
            minNights: 1,
            maxNights: 30,
        },
        cancellationPolicy: 'moderate',
        instantBook: false,
    });

    const [imageUrls, setImageUrls] = useState<string[]>([]);

    useEffect(() => {
        if (isEditMode) {
            loadProperty();
        }
    }, [id]);

    const loadProperty = async () => {
        setLoading(true);
        try {
            const response = await api.get(`/properties/${id}`);
            const property = response.data.data;
            setFormData({
                title: property.title,
                description: property.description,
                propertyType: property.propertyType,
                address: property.address,
                capacity: property.capacity,
                amenities: property.amenities,
                images: property.images,
                pricing: property.pricing,
                houseRules: property.houseRules,
                cancellationPolicy: property.cancellationPolicy,
                instantBook: property.instantBook,
            });
            setImageUrls(property.images?.map((img: any) => img.url) || []);
        } catch (error: any) {
            console.error('Error loading property:', error);
            showError('Failed to load property');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleNestedChange = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: {
                ...(prev[parent as keyof typeof prev] as any),
                [field]: value,
            },
        }));
    };

    const handleAmenityToggle = (amenityId: string) => {
        setFormData(prev => ({
            ...prev,
            amenities: prev.amenities?.includes(amenityId)
                ? prev.amenities.filter(a => a !== amenityId)
                : [...(prev.amenities || []), amenityId],
        }));
    };

    const handleImageUrlAdd = () => {
        const url = prompt('Enter image URL:');
        if (url) {
            setImageUrls(prev => [...prev, url]);
            setFormData(prev => ({
                ...prev,
                images: [...(prev.images || []), { url, isPrimary: imageUrls.length === 0 }],
            }));
        }
    };

    const handleImageRemove = (index: number) => {
        setImageUrls(prev => prev.filter((_, i) => i !== index));
        setFormData(prev => ({
            ...prev,
            images: prev.images?.filter((_, i) => i !== index),
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError(null);

        try {
            // Transform data for backend
            const payload: CreatePropertyData = {
                ...formData,
                propertyType: formData.propertyType?.toLowerCase().replace(' ', '_'), // e.g. "Entire Home" -> "entire_home" - wait, backend expects 'house', 'apartment', etc.
                // Let's map it correctly based on the backend enum: ['house', 'apartment', 'villa', 'cottage', 'cabin', 'other']
                // The frontend list is: ['Entire Home', 'Private Room', 'Shared Room', 'Cottage', 'Villa', 'Apartment', 'Farmhouse', 'Treehouse']
                // Mapping strategy: 
                // Cottage -> cottage, Villa -> villa, Apartment -> apartment
                // Entire Home -> house
                // Others -> other
            } as any;

            // Manual mapping for property type to match backend enum
            const typeMapping: { [key: string]: string } = {
                'Entire Home': 'house',
                'Apartment': 'apartment',
                'Villa': 'villa',
                'Cottage': 'cottage',
                'Private Room': 'other', // fallback
                'Shared Room': 'other',
                'Farmhouse': 'house',
                'Treehouse': 'cabin' // close match
            };

            payload.propertyType = typeMapping[formData.propertyType || 'Entire Home'] || 'other';

            // Ensure address has all required fields
            payload.address = {
                ...formData.address!,
                postalCode: formData.address?.postalCode || '',
                coordinates: {
                    latitude: 0, // Default coordinates as we don't have map picker yet
                    longitude: 0
                }
            };

            if (isEditMode) {
                await updateProperty(id!, payload);
            } else {
                await createProperty(payload);
            }
            navigate('/host/homestays');
        } catch (error: any) {
            console.error('Error saving property:', error);
            const errorMessage = error.response?.data?.errors
                ? error.response.data.errors.join(', ')
                : error.response?.data?.message || 'Failed to save property';
            showWarning(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Premium Header Section */}
            <div className="bg-primary-600 text-white py-8 lg:py-12">
                <div className="container mx-auto px-6 sm:px-8 lg:px-16">
                    <button
                        onClick={() => navigate('/host/homestays')}
                        className="flex items-center gap-2 text-white hover:text-white mb-6 transition-all px-4 py-2 border-2 border-white/30 rounded-xl hover:bg-white/10 hover:border-white/50 font-medium"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        Back to Properties
                    </button>
                    <div className="flex items-start gap-4 lg:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                            <Home className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
                                {isEditMode ? 'Edit Property' : 'Add New Property'}
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-white/90">
                                {isEditMode ? 'Update your property details' : 'List your property on QuietSummit'}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 sm:px-8 lg:px-16 py-8 lg:py-12 max-w-5xl">

                <form onSubmit={handleSubmit} className="space-y-6 lg:space-y-8">
                    {/* Basic Information */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                                <Home className="w-6 h-6 lg:w-7 lg:h-7 text-blue-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Basic Information</h2>
                        </div>

                        <div className="space-y-5 lg:space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Property Title *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => handleInputChange('title', e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow hover:border-neutral-300"
                                    placeholder="e.g., Cozy Mountain Retreat with Stunning Views"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Description *
                                </label>
                                <textarea
                                    required
                                    rows={6}
                                    value={formData.description}
                                    onChange={(e) => handleInputChange('description', e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow hover:border-neutral-300 resize-none"
                                    placeholder="Describe your property, its unique features, and what makes it special..."
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Property Type *
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.propertyType}
                                        onChange={(e) => handleInputChange('propertyType', e.target.value)}
                                        className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 bg-white appearance-none cursor-pointer text-neutral-900 font-medium shadow-sm hover:shadow-md"
                                        style={{
                                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                            backgroundPosition: 'right 0.75rem center',
                                            backgroundRepeat: 'no-repeat',
                                            backgroundSize: '1.5em 1.5em',
                                        }}
                                    >
                                        {PROPERTY_TYPES.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-emerald-50 rounded-xl flex items-center justify-center">
                                <MapPin className="w-6 h-6 lg:w-7 lg:h-7 text-emerald-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Location</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Street Address *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address?.street}
                                    onChange={(e) => handleNestedChange('address', 'street', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    City *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address?.city}
                                    onChange={(e) => handleNestedChange('address', 'city', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    Country *
                                </label>
                                <div className="relative">
                                    <select
                                        required
                                        value={formData.address?.country}
                                        onChange={(e) => {
                                            const newCountry = e.target.value;
                                            handleNestedChange('address', 'country', newCountry);
                                            // Reset state if switching to India to force dropdown usage
                                            if (newCountry === 'India') {
                                                handleNestedChange('address', 'state', '');
                                            }
                                        }}
                                        className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 bg-white appearance-none cursor-pointer text-neutral-900 font-medium shadow-sm hover:shadow-md"
                                    >
                                        <option value="India">India</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-neutral-500">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-neutral-700 mb-2">
                                    State *
                                </label>
                                {formData.address?.country === 'India' ? (
                                    <div className="relative">
                                        <select
                                            required
                                            value={formData.address?.state}
                                            onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 bg-white appearance-none cursor-pointer text-neutral-900 font-medium shadow-sm hover:shadow-md"
                                        >
                                            <option value="">Select State</option>
                                            {INDIAN_STATES.map(state => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                        <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-neutral-500">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                        </div>
                                    </div>
                                ) : (
                                    <input
                                        type="text"
                                        required
                                        value={formData.address?.state}
                                        onChange={(e) => handleNestedChange('address', 'state', e.target.value)}
                                        className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow hover:border-neutral-300"
                                        placeholder="State/Province"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Postal Code *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address?.postalCode}
                                    onChange={(e) => handleNestedChange('address', 'postalCode', e.target.value)}
                                    className="w-full px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-shadow hover:border-neutral-300"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Capacity */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                                <Users className="w-6 h-6 lg:w-7 lg:h-7 text-purple-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Capacity</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Guests *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity?.guests}
                                    onChange={(e) => handleNestedChange('capacity', 'guests', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bedrooms *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.capacity?.bedrooms}
                                    onChange={(e) => handleNestedChange('capacity', 'bedrooms', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Beds *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    value={formData.capacity?.beds}
                                    onChange={(e) => handleNestedChange('capacity', 'beds', parseInt(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Bathrooms *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    step="0.5"
                                    value={formData.capacity?.bathrooms}
                                    onChange={(e) => handleNestedChange('capacity', 'bathrooms', parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                                <Wifi className="w-6 h-6 lg:w-7 lg:h-7 text-amber-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Amenities</h2>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {AMENITIES_OPTIONS.map(amenity => {
                                const Icon = amenity.icon;
                                const isSelected = formData.amenities?.includes(amenity.id);
                                return (
                                    <button
                                        key={amenity.id}
                                        type="button"
                                        onClick={() => handleAmenityToggle(amenity.id)}
                                        className={`flex items-center gap-3 p-4 border-2 rounded-lg transition-all ${isSelected
                                            ? 'border-primary-500 bg-primary-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <Icon className={`w-5 h-5 ${isSelected ? 'text-primary-600' : 'text-gray-400'}`} />
                                        <span className={`text-sm font-medium ${isSelected ? 'text-primary-900' : 'text-gray-700'}`}>
                                            {amenity.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-pink-50 rounded-xl flex items-center justify-center">
                                <Upload className="w-6 h-6 lg:w-7 lg:h-7 text-pink-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Images</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex gap-4">
                                <label className="flex-1 cursor-pointer">
                                    <div className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2 text-gray-600 hover:text-primary-600">
                                        <Upload className="w-5 h-5" />
                                        <span>Upload Images</span>
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleImageUrlAdd}
                                    className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600"
                                >
                                    Add URL
                                </button>
                            </div>

                            {uploading && (
                                <div className="text-center py-4 text-gray-500">
                                    <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                                    Uploading...
                                </div>
                            )}

                            {imageUrls.length > 0 && (
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {imageUrls.map((url, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={url}
                                                alt={`Property ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => handleImageRemove(index)}
                                                className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                            {index === 0 && (
                                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-primary-600 text-white text-xs rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-green-50 rounded-xl flex items-center justify-center">
                                <DollarSign className="w-6 h-6 lg:w-7 lg:h-7 text-green-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">Pricing</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Base Price (per night) *
                                </label>
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    value={formData.pricing?.basePrice}
                                    onChange={(e) => handleNestedChange('pricing', 'basePrice', parseFloat(e.target.value))}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Weekend Price (optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.pricing?.weekendPrice || ''}
                                    onChange={(e) => handleNestedChange('pricing', 'weekendPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Cleaning Fee (optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.pricing?.cleaningFee || ''}
                                    onChange={(e) => handleNestedChange('pricing', 'cleaningFee', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Security Deposit (optional)
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    value={formData.pricing?.securityDeposit || ''}
                                    onChange={(e) => handleNestedChange('pricing', 'securityDeposit', e.target.value ? parseFloat(e.target.value) : undefined)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* House Rules */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <div className="flex items-center gap-3 lg:gap-4 mb-6 lg:mb-8">
                            <div className="w-12 h-12 lg:w-14 lg:h-14 bg-red-50 rounded-xl flex items-center justify-center">
                                <Home className="w-6 h-6 lg:w-7 lg:h-7 text-red-600" />
                            </div>
                            <h2 className="text-xl lg:text-2xl font-bold text-neutral-900">House Rules</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Check-in Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.houseRules?.checkIn}
                                        onChange={(e) => handleNestedChange('houseRules', 'checkIn', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Check-out Time *
                                    </label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.houseRules?.checkOut}
                                        onChange={(e) => handleNestedChange('houseRules', 'checkOut', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Minimum Nights
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.houseRules?.minNights || 1}
                                        onChange={(e) => handleNestedChange('houseRules', 'minNights', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Maximum Nights
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.houseRules?.maxNights || 30}
                                        onChange={(e) => handleNestedChange('houseRules', 'maxNights', parseInt(e.target.value))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.houseRules?.smoking}
                                        onChange={(e) => handleNestedChange('houseRules', 'smoking', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Smoking Allowed</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.houseRules?.pets}
                                        onChange={(e) => handleNestedChange('houseRules', 'pets', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Pets Allowed</span>
                                </label>

                                <label className="flex items-center gap-3">
                                    <input
                                        type="checkbox"
                                        checked={formData.houseRules?.parties}
                                        onChange={(e) => handleNestedChange('houseRules', 'parties', e.target.checked)}
                                        className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                    />
                                    <span className="text-sm font-medium text-gray-700">Parties/Events Allowed</span>
                                </label>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation Policy */}
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 hover:shadow-lg transition-shadow">
                        <h2 className="text-xl lg:text-2xl font-bold text-neutral-900 mb-6 lg:mb-8">Cancellation Policy</h2>
                        <div className="space-y-3">
                            {CANCELLATION_POLICIES.map(policy => (
                                <label key={policy.value} className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                                    <input
                                        type="radio"
                                        name="cancellationPolicy"
                                        value={policy.value}
                                        checked={formData.cancellationPolicy === policy.value}
                                        onChange={(e) => handleInputChange('cancellationPolicy', e.target.value)}
                                        className="mt-1 w-5 h-5 text-primary-600 focus:ring-primary-500"
                                    />
                                    <div>
                                        <p className="font-medium text-gray-900">{policy.label.split(' - ')[0]}</p>
                                        <p className="text-sm text-gray-600">{policy.label.split(' - ')[1]}</p>
                                    </div>
                                </label>
                            ))}
                        </div>

                        <label className="flex items-center gap-3 mt-6">
                            <input
                                type="checkbox"
                                checked={formData.instantBook}
                                onChange={(e) => handleInputChange('instantBook', e.target.checked)}
                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <div>
                                <span className="text-sm font-medium text-gray-900">Enable Instant Book</span>
                                <p className="text-sm text-gray-600">Guests can book without waiting for approval</p>
                            </div>
                        </label>
                    </div>

                    {/* Submit Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate('/host/homestays')}
                            className="flex-1 px-6 py-3.5 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-400 font-semibold transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transition-all"
                        >
                            {submitting ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="w-5 h-5" />
                                    {isEditMode ? 'Update Property' : 'Create Property'}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
