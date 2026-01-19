import { useEffect, useState, useRef } from 'react';
import { getAdminUsers, updateUserRole, toggleUserStatus, deleteUser, AdminUser } from '@/services/adminApi';
import { Search, Ban, Trash2, ChevronDown, Check, Filter, Shield, Users } from 'lucide-react';
import Loader from '@components/common/Loader';

export default function UserManagement() {
    const [users, setUsers] = useState<AdminUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [pagination, setPagination] = useState<any>(null);
    const [page, setPage] = useState(1);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const filterRef = useRef<HTMLDivElement>(null);

    const roleOptions = [
        { value: '', label: 'All Roles', icon: '👥' },
        { value: 'user', label: 'Member', icon: '👤' },
        { value: 'host', label: 'Host', icon: '🏠' },
        { value: 'admin', label: 'Admin', icon: '⚡' }
    ];

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
                setIsFilterOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        loadUsers();
    }, [page, searchTerm, roleFilter]);

    const loadUsers = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20 };
            if (searchTerm) params.search = searchTerm;
            if (roleFilter) params.role = roleFilter;

            const data = await getAdminUsers(params);
            setUsers(data.users);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: 'member' | 'host' | 'admin') => {
        if (!confirm(`Change user role to ${newRole}?`)) return;

        try {
            // Map member to user for API compatibility
            const apiRole = newRole === 'member' ? 'user' : newRole;
            await updateUserRole(userId, apiRole as 'user' | 'host' | 'admin');
            loadUsers();
        } catch (error) {
            console.error('Error updating role:', error);
            alert('Failed to update role');
        }
    };

    const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
        if (!confirm(`${currentStatus ? 'Deactivate' : 'Activate'} this user?`)) return;

        try {
            await toggleUserStatus(userId, !currentStatus);
            loadUsers();
        } catch (error) {
            console.error('Error toggling status:', error);
            alert('Failed to update status');
        }
    };

    const handleDelete = async (userId: string) => {
        if (!confirm('Delete this user? This action cannot be undone.')) return;

        try {
            await deleteUser(userId);
            loadUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Failed to delete user');
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-purple-50/30 to-pink-50/30 py-8">
            <div className="container mx-auto px-4">
                {/* Premium Header - Light Theme */}
                <div className="mb-10 bg-gradient-to-r from-teal-50 to-emerald-50 rounded-3xl p-8 shadow-sm border border-teal-100 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/40 rounded-full blur-3xl -mr-16 -mt-16"></div>

                    <div className="relative flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm border border-teal-100">
                            <Shield className="w-8 h-8 text-teal-600" />
                        </div>
                        <div>
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-gray-900">User Management</h1>
                            <p className="text-teal-800 flex items-center gap-2 text-lg font-medium">
                                <Users className="w-5 h-5 text-teal-600" />
                                Manage users, roles, and platform access
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex gap-4 flex-wrap items-center">
                        <div className="flex-1 min-w-[200px]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by name or email..."
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 text-sm"
                                />
                            </div>
                        </div>

                        {/* Custom Premium Dropdown */}
                        <div className="relative" ref={filterRef}>
                            <button
                                onClick={() => setIsFilterOpen(!isFilterOpen)}
                                className="flex items-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:border-primary-500 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[180px] transition-all duration-200 text-sm shadow-sm group"
                            >
                                <Filter className="w-4 h-4 text-gray-500 group-hover:text-primary-600 transition-colors" />
                                <span className="flex-1 text-left font-medium text-gray-700">
                                    {roleOptions.find(opt => opt.value === roleFilter)?.label || 'All Roles'}
                                </span>
                                <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isFilterOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {/* Dropdown Menu */}
                            {isFilterOpen && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <div className="py-1">
                                        {roleOptions.map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => {
                                                    setRoleFilter(option.value);
                                                    setIsFilterOpen(false);
                                                    setPage(1); // Reset to first page on filter change
                                                }}
                                                className={`w-full px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors duration-150 ${roleFilter === option.value ? 'bg-primary-50' : ''
                                                    }`}
                                            >
                                                <span className="text-lg">{option.icon}</span>
                                                <span className={`flex-1 text-left text-sm ${roleFilter === option.value ? 'font-semibold text-primary-700' : 'text-gray-700'
                                                    }`}>
                                                    {option.label}
                                                </span>
                                                {roleFilter === option.value && (
                                                    <Check className="w-4 h-4 text-primary-600" />
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Active Filter Badge */}
                        {roleFilter && (
                            <button
                                onClick={() => {
                                    setRoleFilter('');
                                    setPage(1);
                                }}
                                className="px-3 py-2 bg-primary-50 text-primary-700 rounded-lg text-xs font-medium hover:bg-primary-100 transition-colors duration-200 flex items-center gap-2"
                            >
                                Clear Filter
                                <span className="text-primary-500">×</span>
                            </button>
                        )}
                    </div>
                </div>
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stats</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {users.map((user) => (
                                        <tr key={user._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleRoleChange(user._id, e.target.value as any)}
                                                    className="appearance-none pl-4 pr-9 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white min-w-[140px] cursor-pointer hover:border-primary-400 hover:bg-gray-50 transition-all duration-200 shadow-sm font-medium text-gray-700 bg-[length:1rem] bg-[position:right_0.75rem_center] bg-no-repeat [background-image:url('data:image/svg+xml,%3Csvg%20xmlns=%27http://www.w3.org/2000/svg%27%20width=%2716%27%20height=%2716%27%20viewBox=%270%200%2024%2024%27%20fill=%27none%27%20stroke=%27%236b7280%27%20stroke-width=%272%27%20stroke-linecap=%27round%27%20stroke-linejoin=%27round%27%3E%3Cpolyline%20points=%276%209%2012%2015%2018%209%27%3E%3C/polyline%3E%3C/svg%3E')]"
                                                    aria-label={`Change role for ${user.name}`}
                                                    title={`Change role for ${user.name}`}
                                                >
                                                    <option value="user">👤 Member</option>
                                                    <option value="host">🏠 Host</option>
                                                    <option value="admin">⚡ Admin</option>
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                    }`}>
                                                    {user.isActive ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {user.bookingsCount || 0} bookings
                                                {user.role === 'host' && ` • ${user.propertiesCount || 0} properties`}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {new Date(user.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <button
                                                    onClick={() => handleToggleStatus(user._id, user.isActive)}
                                                    className="text-yellow-600 hover:text-yellow-700"
                                                    title={user.isActive ? 'Deactivate' : 'Activate'}
                                                >
                                                    <Ban className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user._id)}
                                                    className="text-red-600 hover:text-red-700"
                                                    title="Delete user"
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
                                <span className="text-gray-600">
                                    Page {page} of {pagination.pages}
                                </span>
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