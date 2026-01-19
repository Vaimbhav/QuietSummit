import { Review } from '../../services/reviewApi';
import { Star } from 'lucide-react';

interface ReviewCardProps {
    review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric'
        });
    };

    const renderStars = (rating: number) => {
        return (
            <div className="flex items-center gap-1">
                {Array.from({ length: 5 }, (_, i) => (
                    <Star
                        key={i}
                        className={`w-4 h-4 ${i < rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-gray-300'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
            {/* Guest Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center shrink-0">
                    {review.guestId.profileImage ? (
                        <img
                            src={review.guestId.profileImage}
                            alt={review.guestId.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-lg font-semibold text-gray-600">
                            {review.guestId.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-gray-900">{review.guestId.name}</h4>
                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="font-semibold text-gray-900">{review.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Comment */}
            <p className="text-gray-700 mb-4">{review.comment}</p>

            {/* Aspect Ratings */}
            {review.aspects && Object.keys(review.aspects).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 pt-4 border-t">
                    {Object.entries(review.aspects).map(([key, value]) => (
                        value && (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                    <span className="text-sm font-medium">{value.toFixed(1)}</span>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Host Reply */}
            {review.hostReply && (
                <div className="mt-4 pt-4 border-t bg-gray-50 -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <p className="text-sm font-semibold text-gray-900 mb-2">Response from host</p>
                    <p className="text-sm text-gray-700">{review.hostReply.comment}</p>
                    <p className="text-xs text-gray-500 mt-2">
                        {formatDate(review.hostReply.createdAt)}
                    </p>
                </div>
            )}
        </div>
    );
}
