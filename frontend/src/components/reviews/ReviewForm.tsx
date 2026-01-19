import { useState } from 'react';
import { createReview, CreateReviewData } from '../../services/reviewApi';
import { Star } from 'lucide-react';

interface ReviewFormProps {
    propertyId?: string;
    hostId?: string;
    bookingId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ReviewForm({ propertyId, hostId, bookingId, onSuccess, onCancel }: ReviewFormProps) {
    const [formData, setFormData] = useState<CreateReviewData>({
        propertyId,
        hostId,
        bookingId,
        rating: 5,
        comment: '',
        aspects: {
            cleanliness: 5,
            communication: 5,
            checkIn: 5,
            accuracy: 5,
            location: 5,
            value: 5
        }
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const aspects = [
        { key: 'cleanliness', label: 'Cleanliness' },
        { key: 'communication', label: 'Communication' },
        { key: 'checkIn', label: 'Check-in' },
        { key: 'accuracy', label: 'Accuracy' },
        { key: 'location', label: 'Location' },
        { key: 'value', label: 'Value' }
    ];

    const handleRatingChange = (rating: number) => {
        setFormData(prev => ({ ...prev, rating }));
    };

    const handleAspectChange = (aspect: string, value: number) => {
        setFormData(prev => ({
            ...prev,
            aspects: {
                ...prev.aspects,
                [aspect]: value
            }
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.comment.trim().length < 10) {
            setError('Review must be at least 10 characters long');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            await createReview(formData);
            onSuccess?.();
        } catch (error: any) {
            console.error('Error creating review:', error);
            setError(error.response?.data?.message || 'Failed to submit review');
        } finally {
            setLoading(false);
        }
    };

    const renderStarSelector = (currentRating: number, onChange: (rating: number) => void) => {
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                    <button
                        key={i}
                        type="button"
                        onClick={() => onChange(i + 1)}
                        className="focus:outline-none"
                    >
                        <Star
                            className={`w-6 h-6 cursor-pointer transition-colors ${i < currentRating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300 hover:text-yellow-200'
                                }`}
                        />
                    </button>
                ))}
                <span className="ml-2 text-sm font-medium text-gray-700">
                    {currentRating.toFixed(1)}
                </span>
            </div>
        );
    };

    return (
        <div className="bg-white rounded-xl shadow-sm p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Write a Review</h3>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg mb-6">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Overall Rating */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Overall Rating *
                    </label>
                    {renderStarSelector(formData.rating, handleRatingChange)}
                </div>

                {/* Aspect Ratings */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rate Different Aspects
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {aspects.map(aspect => (
                            <div key={aspect.key}>
                                <label className="block text-sm text-gray-600 mb-2">
                                    {aspect.label}
                                </label>
                                {renderStarSelector(
                                    formData.aspects?.[aspect.key as keyof typeof formData.aspects] || 5,
                                    (rating) => handleAspectChange(aspect.key, rating)
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Comment */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review *
                    </label>
                    <textarea
                        value={formData.comment}
                        onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
                        rows={5}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Share your experience with this property..."
                        required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters ({formData.comment.length}/10)
                    </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4">
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Submitting...' : 'Submit Review'}
                    </button>
                </div>
            </form>
        </div>
    );
}
