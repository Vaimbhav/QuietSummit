import { useState, useEffect } from 'react';
import { getPropertyReviews, Review, ReviewsResponse } from '../../services/reviewApi';
import ReviewCard from './ReviewCard';
import { Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '../common/Loader';

interface PropertyReviewsProps {
    propertyId: string;
    averageRating?: number;
    totalReviews?: number;
}

export default function PropertyReviews({ propertyId, averageRating = 0, totalReviews = 0 }: PropertyReviewsProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState({
        page: 1,
        pages: 1,
        total: 0,
        limit: 10
    });
    const [sort, setSort] = useState('recent');

    useEffect(() => {
        loadReviews();
    }, [propertyId, pagination.page, sort]);

    const loadReviews = async () => {
        setLoading(true);
        setError(null);
        try {
            const data: ReviewsResponse = await getPropertyReviews(propertyId, {
                page: pagination.page,
                limit: 10,
                sort
            });
            setReviews(data.reviews);
            setPagination(data.pagination);
        } catch (error: any) {
            console.error('Error loading reviews:', error);
            setError(error.response?.data?.message || 'Failed to load reviews');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setPagination(prev => ({ ...prev, page: newPage }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (loading && reviews.length === 0) {
        return (
            <div className="flex justify-center py-12">
                <Loader />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-6 mb-4">
                    <div className="text-center">
                        <div className="text-4xl font-bold text-gray-900 mb-1">
                            {averageRating.toFixed(1)}
                        </div>
                        <div className="flex items-center justify-center gap-1">
                            {Array.from({ length: 5 }, (_, i) => (
                                <Star
                                    key={i}
                                    className={`w-4 h-4 ${i < Math.floor(averageRating)
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                />
                            ))}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                            {totalReviews} review{totalReviews !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex-1 border-l pl-6">
                        <h3 className="font-semibold text-gray-900 mb-2">Guest Reviews</h3>
                        <p className="text-sm text-gray-600">
                            Read what guests are saying about their experience at this property
                        </p>
                    </div>
                </div>

                {/* Sort Filter */}
                <div className="flex items-center justify-between pt-4 border-t">
                    <p className="text-sm text-gray-600">
                        Showing {reviews.length} of {pagination.total} reviews
                    </p>
                    <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value)}
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 text-sm"
                        aria-label="Sort reviews"
                    >
                        <option value="recent">Most Recent</option>
                        <option value="highest">Highest Rated</option>
                        <option value="lowest">Lowest Rated</option>
                    </select>
                </div>
            </div>

            {/* Error State */}
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Reviews List */}
            {reviews.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No reviews yet</h3>
                    <p className="text-gray-600">Be the first to review this property!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <ReviewCard key={review._id} review={review} />
                    ))}
                </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-center gap-4 pt-6">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Previous
                    </button>
                    <span className="text-sm text-gray-600">
                        Page {pagination.page} of {pagination.pages}
                    </span>
                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page === pagination.pages}
                        className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            )}
        </div>
    );
}
