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
                            ? 'fill-[#5CE1E6] text-[#5CE1E6]'
                            : 'text-[#B0B7C3]'
                            }`}
                    />
                ))}
            </div>
        );
    };

    return (
        <div className="bg-[#0a0e27] border border-[#5ce1e6]/10 rounded-xl p-6">
            {/* Guest Info */}
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 bg-[#1e2139] rounded-full flex items-center justify-center shrink-0">
                    {review.guestId.profileImage ? (
                        <img
                            src={review.guestId.profileImage}
                            alt={review.guestId.name}
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <span className="text-lg font-semibold text-[#B0B7C3]">
                            {review.guestId.name.charAt(0).toUpperCase()}
                        </span>
                    )}
                </div>
                <div className="flex-1">
                    <div className="flex items-start justify-between">
                        <div>
                            <h4 className="font-semibold text-white">{review.guestId.name}</h4>
                            <p className="text-sm text-[#B0B7C3]">{formatDate(review.createdAt)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                            {renderStars(review.rating)}
                            <span className="font-semibold text-white">{review.rating.toFixed(1)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Review Comment */}
            <p className="text-[#B0B7C3] mb-4">{review.comment}</p>

            {/* Aspect Ratings */}
            {review.aspects && Object.keys(review.aspects).length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4 pt-4 border-t border-[#5ce1e6]/20">
                    {Object.entries(review.aspects).map(([key, value]) => (
                        value && (
                            <div key={key} className="flex items-center justify-between">
                                <span className="text-sm text-[#B0B7C3] capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                                <div className="flex items-center gap-1">
                                    <Star className="w-3 h-3 fill-[#5CE1E6] text-[#5CE1E6]" />
                                    <span className="text-sm font-medium text-white">{value.toFixed(1)}</span>
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}

            {/* Host Reply */}
            {review.hostReply && (
                <div className="mt-4 pt-4 border-t border-[#5ce1e6]/20 bg-[#1e2139] -mx-6 -mb-6 px-6 py-4 rounded-b-xl">
                    <p className="text-sm font-semibold text-white mb-2">Response from host</p>
                    <p className="text-sm text-[#B0B7C3]">{review.hostReply.comment}</p>
                    <p className="text-xs text-[#B0B7C3] mt-2">
                        {formatDate(review.hostReply.createdAt)}
                    </p>
                </div>
            )}
        </div>
    );
}
