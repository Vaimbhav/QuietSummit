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
        <div className="space-y-4">
            {/* Booking Summary */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(61, 157, 163, 0.1)', border: '1px solid rgba(92, 225, 230, 0.3)' }}>
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#ffffff' }}>Booking Summary</h3>

                <div className="space-y-3">
                    <div className="flex items-start gap-4">
                        <img
                            src={property.images[0]?.url}
                            alt={property.title}
                            className="w-20 h-20 rounded-lg object-cover"
                        />
                        <div className="flex-1">
                            <h4 className="font-semibold" style={{ color: '#ffffff' }}>{property.title}</h4>
                            <p className="text-sm" style={{ color: '#B0B7C3' }}>
                                {property.address.city}, {property.address.state}
                            </p>
                            <p className="text-sm" style={{ color: '#B0B7C3' }}>{property.propertyType}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4" style={{ borderTop: '1px solid rgba(92, 225, 230, 0.2)' }}>
                        <div>
                            <p className="text-xs mb-1" style={{ color: '#5CE1E6' }}>Check-in</p>
                            <p className="font-medium" style={{ color: '#ffffff' }}>{formatDate(checkIn)}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: '#5CE1E6' }}>Check-out</p>
                            <p className="font-medium" style={{ color: '#ffffff' }}>{formatDate(checkOut)}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: '#5CE1E6' }}>Guests</p>
                            <p className="font-medium" style={{ color: '#ffffff' }}>{guests} guest{guests > 1 ? 's' : ''}</p>
                        </div>
                        <div>
                            <p className="text-xs mb-1" style={{ color: '#5CE1E6' }}>Nights</p>
                            <p className="font-medium" style={{ color: '#ffffff' }}>{priceBreakdown.nights} night{priceBreakdown.nights > 1 ? 's' : ''}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Price Breakdown */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Price Details</h3>
                </div>

                <div className="space-y-3">
                    <div className="flex justify-between" style={{ color: '#B0B7C3' }}>
                        <span>₹{property.pricing.basePrice} × {priceBreakdown.nights} nights</span>
                        <span>₹{priceBreakdown.basePrice}</span>
                    </div>
                    {priceBreakdown.cleaningFee > 0 && (
                        <div className="flex justify-between" style={{ color: '#B0B7C3' }}>
                            <span>Cleaning fee</span>
                            <span>₹{priceBreakdown.cleaningFee}</span>
                        </div>
                    )}
                    <div className="pt-3 flex justify-between font-bold text-lg" style={{ borderTop: '1px solid rgba(92, 225, 230, 0.2)', color: '#ffffff' }}>
                        <span>Total (INR)</span>
                        <span>₹{priceBreakdown.totalPrice}</span>
                    </div>
                </div>
            </div>

            {/* Guest Information */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Guest Information</h3>
                    <button
                        onClick={() => onEdit(1)}
                        className="text-sm font-medium"
                        style={{ color: '#5CE1E6' }}
                    >
                        Edit
                    </button>
                </div>

                <div className="space-y-3">
                    <div>
                        <p className="text-xs mb-1" style={{ color: '#5CE1E6' }}>Primary Guest</p>
                        <p className="font-medium" style={{ color: '#ffffff' }}>{primaryGuest.name}</p>
                        <p className="text-sm" style={{ color: '#B0B7C3' }}>{primaryGuest.email}</p>
                        <p className="text-sm" style={{ color: '#B0B7C3' }}>{primaryGuest.phone}</p>
                    </div>

                    {additionalGuests.length > 0 && (
                        <div className="pt-3" style={{ borderTop: '1px solid rgba(92, 225, 230, 0.2)' }}>
                            <p className="text-xs mb-2" style={{ color: '#5CE1E6' }}>Additional Guests</p>
                            {additionalGuests.map((guest, index) => (
                                <p key={index} className="text-sm" style={{ color: '#B0B7C3' }}>
                                    {guest.name} ({guest.age} years)
                                </p>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Special Requests */}
            {(specialRequests.arrivalTime || specialRequests.requests || specialRequests.tripPurpose) && (
                <div className="rounded-xl p-6" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Special Requests</h3>
                        <button
                            onClick={() => onEdit(2)}
                            className="text-sm font-medium"
                            style={{ color: '#5CE1E6' }}
                        >
                            Edit
                        </button>
                    </div>

                    <div className="space-y-2 text-sm">
                        {specialRequests.tripPurpose && (
                            <p style={{ color: '#B0B7C3' }}>
                                <span className="font-medium" style={{ color: '#5CE1E6' }}>Purpose:</span> {specialRequests.tripPurpose}
                            </p>
                        )}
                        {specialRequests.arrivalTime && (
                            <p style={{ color: '#B0B7C3' }}>
                                <span className="font-medium" style={{ color: '#5CE1E6' }}>Arrival:</span> {specialRequests.arrivalTime}
                            </p>
                        )}
                        {specialRequests.requests && (
                            <div>
                                <p className="font-medium mb-1" style={{ color: '#5CE1E6' }}>Additional Requests:</p>
                                <p className="whitespace-pre-line" style={{ color: '#B0B7C3' }}>{specialRequests.requests}</p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Cancellation Policy */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>Cancellation Policy</h3>
                <p className="text-sm mb-4" style={{ color: '#B0B7C3' }}>
                    Free cancellation up to 48 hours before check-in. After that, cancellations will incur a 50% charge.
                </p>
                <label className="flex items-start gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={acceptedCancellation}
                        onChange={(e) => onCancellationChange(e.target.checked)}
                        className="mt-1 w-4 h-4 rounded"
                        style={{ accentColor: '#5CE1E6' }}
                    />
                    <span className="text-sm" style={{ color: '#B0B7C3' }}>
                        I understand and accept the cancellation policy
                    </span>
                </label>
            </div>

            {/* Terms & Conditions */}
            <div className="rounded-xl p-6" style={{ background: 'rgba(30, 33, 57, 0.9)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                <h3 className="text-lg font-semibold mb-3" style={{ color: '#ffffff' }}>Terms & Conditions</h3>
                <div className="space-y-3">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => onTermsChange(e.target.checked)}
                            className="mt-1 w-4 h-4 rounded"
                            style={{ accentColor: '#5CE1E6' }}
                        />
                        <span className="text-sm" style={{ color: '#B0B7C3' }}>
                            I agree to the{' '}
                            <a href="/terms" className="hover:underline" style={{ color: '#5CE1E6' }} target="_blank">
                                Terms of Service
                            </a>{' '}
                            and{' '}
                            <a href="/privacy" className="hover:underline" style={{ color: '#5CE1E6' }} target="_blank">
                                Privacy Policy
                            </a>
                        </span>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            className="mt-1 w-4 h-4 rounded"
                            style={{ accentColor: '#5CE1E6' }}
                        />
                        <span className="text-sm" style={{ color: '#B0B7C3' }}>
                            I acknowledge that I have read and agree to the house rules
                        </span>
                    </label>
                </div>
            </div>

            {(!acceptedTerms || !acceptedCancellation) && (
                <div className="rounded-lg p-4" style={{ background: 'rgba(255, 100, 100, 0.15)', border: '1px solid rgba(255, 100, 100, 0.3)' }}>
                    <p className="text-sm" style={{ color: '#ff6464' }}>
                        Please accept the cancellation policy and terms & conditions to proceed with booking.
                    </p>
                </div>
            )}
        </div>
    );
}

export { type BookingReviewProps };
