import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getHostProperties, deleteProperty } from '../../services/hostApi';
import { Plus, Edit, Trash2, Eye, Calendar } from 'lucide-react';
import Loader from '../../components/common/Loader';

export default function PropertyManagement() {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filter, setFilter] = useState('all');
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    useEffect(() => {
        loadProperties();
    }, [filter]);

    const loadProperties = async () => {
        setLoading(true);
        setError(null);
        try {
            // Map 'active' filter to 'approved' status for API
            const statusMap: { [key: string]: string } = {
                'active': 'approved',
                'pending': 'pending_review',
                'inactive': 'inactive'
            };
            const apiStatus = filter !== 'all' ? statusMap[filter] || filter : undefined;
            const params = apiStatus ? { status: apiStatus } : {};
            const data = await getHostProperties(params);
            setProperties(data.properties || []);
        } catch (error: any) {
            console.error('Error loading properties:', error);
            setError(error.response?.data?.message || 'Failed to load properties');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (propertyId: string) => {
        try {
            await deleteProperty(propertyId);
            setProperties(prev => prev.filter(p => p._id !== propertyId));
            setDeleteConfirm(null);
        } catch (error: any) {
            console.error('Error deleting property:', error);
            alert(error.response?.data?.message || 'Failed to delete property');
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
            <div className="bg-primary-600 text-white py-16 sm:py-20 lg:py-24">
                <div className="container mx-auto px-6 sm:px-8 lg:px-16">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                        <div className="flex items-start gap-5 lg:gap-8">
                            <div className="w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                                <Calendar className="w-8 h-8 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-3xl lg:text-5xl font-extrabold mb-4 leading-tight">
                                    Property Management
                                </h1>
                                <p className="text-base sm:text-base lg:text-lg text-white/95 font-medium mb-5">
                                    Manage your property listings
                                </p>
                                {/* Mobile Add Property Button */}
                                <Link
                                    to="/host/homestays/new"
                                    className="md:hidden inline-flex items-center justify-center gap-3 px-6 py-3.5 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add Property
                                </Link>
                            </div>
                        </div>
                        <Link
                            to="/host/homestays/new"
                            className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-xl hover:bg-primary-50 transition-colors shadow-md hover:shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Add Property
                        </Link>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 sm:px-8 lg:px-16 py-10 lg:py-16">
                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-6 lg:p-8 mb-10 lg:mb-12">
                    {/* Mobile Dropdown */}
                    <div className="md:hidden">
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full px-5 py-4 pr-12 border-2 border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all hover:border-neutral-300 bg-white appearance-none cursor-pointer text-neutral-900 font-bold text-base shadow-sm"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                backgroundPosition: 'right 1rem center',
                                backgroundRepeat: 'no-repeat',
                                backgroundSize: '1.5em 1.5em',
                            }}
                        >
                            <option value="all">All Properties</option>
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    {/* Desktop Buttons */}
                    <div className="hidden md:flex flex-wrap gap-3">
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filter === 'all'
                                ? 'bg-primary-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            All Properties
                        </button>
                        <button
                            onClick={() => setFilter('active')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filter === 'active'
                                ? 'bg-green-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            Active
                        </button>
                        <button
                            onClick={() => setFilter('pending')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filter === 'pending'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilter('inactive')}
                            className={`px-5 py-2.5 rounded-xl font-semibold transition-all ${filter === 'inactive'
                                ? 'bg-neutral-600 text-white shadow-md'
                                : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                                }`}
                        >
                            Inactive
                        </button>
                    </div>
                </div>

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 text-red-800 px-6 py-4 rounded-lg mb-8 shadow-sm">
                        {error}
                    </div>
                )}

                {/* Properties Grid */}
                {properties.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-md border border-neutral-100 p-16 lg:p-20 text-center">
                        <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-8">
                            <Plus className="w-10 h-10 text-neutral-400" />
                        </div>
                        <h3 className="text-2xl font-bold text-neutral-900 mb-3">No properties found</h3>
                        <p className="text-neutral-600 mb-8 text-lg">Start by adding your first property</p>
                        <Link
                            to="/host/homestays/new"
                            className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary-600 text-white rounded-xl hover:bg-primary-700 font-semibold shadow-md hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            Add Property
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                        {properties.map((property) => (
                            <div key={property._id} className="bg-white rounded-2xl shadow-md border border-neutral-100 overflow-hidden hover:shadow-xl transition-all">
                                {/* Image */}
                                <div className="relative h-56">
                                    <img
                                        src={property.images?.[0]?.url || '/images/placeholder.jpg'}
                                        alt={property.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                                    <span className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md ${property.status === 'approved'
                                        ? 'bg-green-100/90 text-green-800'
                                        : property.status === 'pending_review'
                                            ? 'bg-amber-100/90 text-amber-800'
                                            : property.status === 'inactive'
                                                ? 'bg-neutral-100/90 text-neutral-800'
                                                : 'bg-blue-100/90 text-blue-800'
                                        }`}>
                                        {property.status === 'approved' ? 'Active' :
                                            property.status === 'pending_review' ? 'Pending' :
                                                property.status === 'inactive' ? 'Inactive' : property.status}
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="p-7">
                                    <h3 className="font-bold text-neutral-900 mb-3 line-clamp-1 text-lg">{property.title}</h3>
                                    <p className="text-sm text-neutral-600 mb-5 flex items-center gap-1.5">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {property.address?.city}, {property.address?.state}
                                    </p>
                                    <div className="flex items-center justify-between mb-6 pb-6 border-b border-neutral-100">
                                        <div>
                                            <span className="text-2xl font-bold text-neutral-900">
                                                ₹{property.pricing?.basePrice}
                                            </span>
                                            <span className="text-sm text-neutral-500">/night</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-neutral-600 bg-neutral-50 px-3 py-1.5 rounded-lg">
                                            <Calendar className="w-4 h-4" />
                                            <span className="font-medium">{property.capacity?.bedrooms} beds</span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex gap-3">
                                        <Link
                                            to={`/homestays/${property.slug}`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-neutral-200 text-neutral-700 rounded-xl hover:bg-neutral-50 hover:border-neutral-300 text-sm font-semibold transition-all"
                                        >
                                            <Eye className="w-4 h-4" />
                                            View
                                        </Link>
                                        <Link
                                            to={`/host/homestays/${property._id}/edit`}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 text-sm font-semibold shadow-md hover:shadow-lg transition-all"
                                        >
                                            <Edit className="w-4 h-4" />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => setDeleteConfirm(property._id)}
                                            className="px-4 py-3 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Delete Confirmation Modal */}
                {deleteConfirm && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-2xl p-10 max-w-md w-full shadow-2xl">
                            <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Trash2 className="w-6 h-6 text-red-600" />
                            </div>
                            <h3 className="text-2xl font-bold text-neutral-900 mb-4 text-center">Delete Property?</h3>
                            <p className="text-neutral-600 mb-10 text-center">
                                Are you sure you want to delete this property? This action cannot be undone.
                            </p>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setDeleteConfirm(null)}
                                    className="flex-1 px-6 py-3.5 border-2 border-neutral-300 text-neutral-700 rounded-xl hover:bg-neutral-50 font-semibold transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => handleDelete(deleteConfirm)}
                                    className="flex-1 px-6 py-3.5 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold shadow-md hover:shadow-lg transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
