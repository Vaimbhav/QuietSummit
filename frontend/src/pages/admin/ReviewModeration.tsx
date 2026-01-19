import { useEffect, useState } from 'react';
import { getAdminReviews, deleteReview, resolveReportedReview, AdminReview } from '@/services/adminApi';
import { AlertTriangle, Trash2, CheckCircle, Star, MessageSquare, Shield } from 'lucide-react';
import Loader from '@components/common/Loader';

export default function ReviewModeration() {
    const [reviews, setReviews] = useState<AdminReview[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'reported'>('reported');
    const [pagination, setPagination] = useState<any>(null);
    const [page, setPage] = useState(1);

    useEffect(() => {
        loadReviews();
    }, [page, filter]);

    const loadReviews = async () => {
        setLoading(true);
        try {
            const params: any = { page, limit: 20 };
            if (filter === 'reported') params.reported = true;

            const data = await getAdminReviews(params);
            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (error) {
            console.error('Error loading reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (reviewId: string) => {
        if (!confirm('Delete this review? This action cannot be undone.')) return;

        try {
            await deleteReview(reviewId);
            loadReviews();
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    const handleResolve = async (reviewId: string, action: 'keep' | 'delete') => {
        if (!confirm(`${action === 'delete' ? 'Delete' : 'Keep'} this reported review?`)) return;

        try {
            await resolveReportedReview(reviewId, action);
            loadReviews();
        } catch (error) {
            console.error('Error resolving review:', error);
            alert('Failed to resolve review');
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
                            <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight text-gray-900">Review Moderation</h1>
                            <p className="text-teal-800 flex items-center gap-2 text-lg font-medium">
                                <MessageSquare className="w-5 h-5 text-teal-600" />
                                Moderate user reviews and content
                            </p>
                        </div>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex gap-3">
                        <button
                            onClick={() => setFilter('reported')}
                            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${filter === 'reported'
                                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" />
                                Reported Reviews
                            </div>
                        </button>
                        <button
                            onClick={() => setFilter('all')}
                            className={`px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${filter === 'all'
                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md'
                                : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            <div className="flex items-center gap-2">
                                <Star className="w-4 h-4" />
                                All Reviews
                            </div>
                        </button>
                    </div>
                </div>

                {/* Reviews List */}
                {loading ? (
                    <div className="flex justify-center py-12">
                        <Loader />
                    </div>
                ) : reviews.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="w-10 h-10 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">All clear!</h3>
                        <p className="text-gray-600 text-lg">No {filter === 'reported' ? 'reported' : ''} reviews to moderate</p>
                    </div>
                ) : (
                    <div className="space-y-5">
                        {reviews.map((review) => (
                            <div key={review._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200">
                                {review.reported && (
                                    <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-xl p-4 mb-5 flex items-start gap-3">
                                        <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                                            <AlertTriangle className="w-5 h-5 text-red-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-red-900 mb-1">🚨 Reported Review</p>
                                            {review.reportReason && (
                                                <p className="text-sm text-red-700">Reason: {review.reportReason}</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-3">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                                                <span className="text-blue-700 font-bold text-sm">{review.guestId.name.charAt(0)}</span>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-gray-900">{review.guestId.name}</h3>
                                                <span className="text-sm text-gray-500">{review.propertyId.title}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 mb-4">
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={`w-5 h-5 ${i < review.rating ? 'text-amber-400 fill-amber-400' : 'text-gray-200'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                            <span className="text-sm text-gray-500 font-medium">
                                                {new Date(review.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </span>
                                        </div>
                                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3 pt-5 border-t border-gray-100">
                                    {review.reported ? (
                                        <>
                                            <button
                                                onClick={() => handleResolve(review._id, 'keep')}
                                                className="px-5 py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 flex items-center gap-2 font-semibold shadow-sm transition-all"
                                            >
                                                <CheckCircle className="w-4 h-4" />
                                                Keep Review
                                            </button>
                                            <button
                                                onClick={() => handleResolve(review._id, 'delete')}
                                                className="px-5 py-2.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:from-red-600 hover:to-red-700 flex items-center gap-2 font-semibold shadow-sm transition-all"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                                Delete Review
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="px-5 py-2.5 border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 flex items-center gap-2 font-semibold transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            Delete
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                    <div className="flex justify-center items-center gap-3 mt-8">
                        <button
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                        >
                            Previous
                        </button>
                        <span className="text-gray-700 font-medium px-4">
                            Page {page} of {pagination.pages}
                        </span>
                        <button
                            onClick={() => setPage(p => Math.min(pagination.pages, p + 1))}
                            disabled={page === pagination.pages}
                            className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
