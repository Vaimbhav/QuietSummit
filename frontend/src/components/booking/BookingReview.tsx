import { Property } from '../../services/propertyApi';


interface BookingReviewProps {
    property: Property;
    checkIn: string;
    checkOut: string;
    guests: number;
    priceBreakdown: {
        basePrice: number;
        cleaningFee: number;
        totalPrice: number;
        nights: number;
    };
    primaryGuest: {
        name: string;
        email: string;
        phone: string;
        country: string;
    };
    additionalGuests: Array<{ name: string; age: number }>;
    specialRequests: {
        arrivalTime: string;
        requests: string;
        tripPurpose: string;
    };
    onEdit: (step: number) => void;
    acceptedTerms: boolean;
    acceptedCancellation: boolean;
    onTermsChange: (accepted: boolean) => void;
    onCancellationChange: (accepted: boolean) => void;
}

export default function BookingReview({
    property,
    checkIn,
    checkOut,
    guests,
    priceBreakdown,
    primaryGuest,
    additionalGuests,
    specialRequests,
    onEdit,
    acceptedTerms,
    acceptedCancellation,
    onTermsChange,
    onCancellationChange,
}: BookingReviewProps) {

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <div className="space-y-6">
            {/* Booking Summary */}
            <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Booking Summary</h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-4">
                        <img
                            src={property.images[0]?.url}
                            alt={property.title}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold text-gray-900">{property.title}</h4>
                            <p className="text-sm text-gray-600">
                                {property.address.city}, {property.address.state}
                            </p>
                            <p className="text-sm text-gray-600">{property.propertyType}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-primary-200">
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Check-in</p>
                            <p className="font-medium text-gray-900">{formatDate(checkIn)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Check-out</p>
                            <p className="font-medium text-gray-900">{formatDate(checkOut)}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Guests</p>
                            <p className="font-medium text-gray-900">{guests} guest{guests > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <p className="text-xs text-gray-600 mb-1">Nights</p>
                            <p className="font-medium text-gray-900">{priceBreakdown.nights} night{priceBreakdown.nights > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Price Details</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between text-gray-700">
                        <span>₹{property.pricing.basePrice} × {priceBreakdown.nights} nights</span>
                        <span>₹{priceBreakdown.basePrice}</span>
                    </div>
                    {priceBreakdown.cleaningFee > 0 && (
                        <div className="flex justify-between text-gray-700">
                            <span>Cleaning fee</span>
                            <span>₹{priceBreakdown.cleaningFee}</span>
                        </div>
                    )}
                    <div className="pt-3 border-t border-gray-200 flex justify-between font-bold text-lg text-gray-900">
                        <span>Total (INR)</span>
                        <span>₹{priceBreakdown.totalPrice}</span>
                    </div>
                </div>
            </div>

            {/* Guest Information */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">Guest Information</h3>
                    <button
                        onClick={() => onEdit(1)}
                        className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                    >
                        Edit
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-xs text-gray-600 mb-1">Primary Guest</p>
                        <p className="font-medium text-gray-900">{primaryGuest.name}</p>
                        <p className="text-sm text-gray-600">{primaryGuest.email}</p>
                        <p className="text-sm text-gray-600">{primaryGuest.phone}</p>
                    </div>

                    {additionalGuests.length > 0 && (
                        <div className="pt-3 border-t border-gray-200">
                            <p className="text-xs text-gray-600 mb-2">Additional Guests</p>
                            {additionalGuests.map((guest, index) => (
                                <p key={index} className="text-sm text-gray-700">
                                    {guest.name} ({guest.age} years)
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Special Requests */}
            {(specialRequests.arrivalTime || specialRequests.requests || specialRequests.tripPurpose) && (
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Special Requests</h3>
                        <button
                            onClick={() => onEdit(2)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                        >
                            Edit
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        {specialRequests.tripPurpose && (
                            <p className="text-gray-700">
                                <span className="font-medium">Purpose:</span> {specialRequests.tripPurpose}
                            </p>
                        )}
                        {specialRequests.arrivalTime && (
                            <p className="text-gray-700">
                                <span className="font-medium">Arrival:</span> {specialRequests.arrivalTime}
                            </p>
                        )}
                        {specialRequests.requests && (
                            <div>
                                <p className="font-medium text-gray-700 mb-1">Additional Requests:</p>
                                <p className="text-gray-600 whitespace-pre-line">{specialRequests.requests}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancellation Policy */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Cancellation Policy</h3>
                <p className="text-sm text-gray-700 mb-4">
                    Free cancellation up to 48 hours before check-in. After that, cancellations will incur a 50% charge.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={acceptedCancellation}
                        onChange={(e) => onCancellationChange(e.target.checked)}
                        className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <span className="text-sm text-gray-700">
                        I understand and accept the cancellation policy
                    </span>
                </label>
            </div>

            {/* Terms & Conditions */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Terms & Conditions</h3>
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => onTermsChange(e.target.checked)}
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                            I agree to the{' '}
                            <a href="/terms" className="text-primary-600 hover:underline" target="_blank">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="text-primary-600 hover:underline" target="_blank">
                                Privacy Policy
                            </a>
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">
                            I acknowledge that I have read and agree to the house rules
                        </span>
                    </label>
                </div>
            </div>

            {(!acceptedTerms || !acceptedCancellation) && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-sm text-red-800">
                        Please accept the cancellation policy and terms & conditions to proceed with booking.
                    </p>
                </div>
            )}
        </div>
    );
}

export { type BookingReviewProps };
