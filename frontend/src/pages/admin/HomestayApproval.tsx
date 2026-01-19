import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAdminProperties, updatePropertyStatus, deleteProperty, AdminProperty } from '@/services/adminApi';
import { Search, CheckCircle, XCircle, Trash2, Home, Shield } from 'lucide-react';
import Loader from '@components/common/Loader';

export default function PropertyApproval() {
    const [properties, setProperties] = useState<AdminProperty[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('pending');
    const [pagination, setPagination] = useState<any>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadProperties();
    }, [page, searchTerm, statusFilter]);

    const loadProperties = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            if (statusFilter) params.status = statusFilter;

            const data = await getAdminProperties(params);
            setProperties(data.properties);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (propertyId: string, newStatus: 'active' | 'pending' | 'inactive') => {
        if (!confirm(`Change property status to ${newStatus}?`)) return;

        let reason = '';
        if (newStatus === 'inactive') {
            const input = prompt('Please enter a reason for rejection:');
            if (!input) return; // Cancel if no reason provided
            reason = input;
        }

        try {
            await updatePropertyStatus(propertyId, newStatus, reason);
            loadProperties();
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (propertyId: string) => {
        if (!confirm('Delete this property? This action cannot be undone.')) return;

        try {
            await deleteProperty(propertyId);
            loadProperties();
        } catch (error) {
            console.error('Error deleting property:', error);
            alert('Failed to delete property');
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-green-100 text-green-800';
            case 'pending_review': return 'bg-yellow-100 text-yellow-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'inactive': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/30 py-8">
            <div className="container mx-auto px-4">
                {/* Premium Header */}
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center shadow-sm">
                            <Shield className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900 mb-1">Property Management</h1>
                            <p className="text-gray-600 flex items-center gap-2">
                                <Home className="w-4 h-4" />
                                {pagination?.total || 0} total properties
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex gap-4 flex-wrap">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search properties..."
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            {['all', 'pending', 'active', 'inactive'].map((status) => (
                                <button
                                    key={status}
                                    onClick={() => setStatusFilter(status === 'all' ? '' : status)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${(status === 'all' && !statusFilter) || statusFilter === status
                                        ? 'bg-primary-600 text-white'
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                >
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Properties Table */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Property</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Host</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Location</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Price</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {properties.map((property) => (
                                        <tr key={property._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{property.title}</div>
                                                    <div className="text-sm text-gray-500">{property.propertyType}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{property.hostId.name}</div>
                                                    <div className="text-sm text-gray-500">{property.hostId.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {property.address.city}, {property.address.state}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                ₹{property.pricing.basePrice}/night
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                                                    {property.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                {property.status === 'pending_review' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleStatusChange(property._id, 'active')}
                                                            className="text-green-600 hover:text-green-700"
                                                            title="Approve"
                                                        >
                                                            <CheckCircle className="w-5 h-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleStatusChange(property._id, 'inactive')}
                                                            className="text-red-600 hover:text-red-700"
                                                            title="Reject"
                                                        >
                                                            <XCircle className="w-5 h-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <Link
                                                    to={`/homestays/${property.slug}`}
                                                    className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                                                >
                                                    View
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(property._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2 p-4 border-t border-gray-200">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Previous
                                </button>
                                <span className="text-gray-600">Page {page} of {pagination.pages}</span>
                                <button
                                    onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                                    disabled={page === pagination.pages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
