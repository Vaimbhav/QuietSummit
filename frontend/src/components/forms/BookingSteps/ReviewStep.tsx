import { Calendar, Users, MapPin, User, Shield, Car, Tag } from 'lucide-react'
import { useState } from 'react'
import Button from '../../common/Button'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'

interface ReviewStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onNext: (data: Partial<BookingData>) => void
    onBack: () => void
}

export default function ReviewStep({ journey, bookingData, onNext, onBack }: ReviewStepProps) {
    const [appliedCoupon] = useState(bookingData.couponDetails || null)

    const calculateTotal = () => {
        const basePrice = journey.basePrice * (bookingData.numberOfTravelers || 1)
        const roomUpgrade =
            bookingData.roomPreference === 'single'
                ? 2000 * (bookingData.numberOfTravelers || 1)
                : 0
        const addOnsTotal = bookingData.addOnsTotal || 0
        const subtotal = basePrice + roomUpgrade + addOnsTotal
        const discount = appliedCoupon?.discount || 0
        const afterDiscount = subtotal - discount
        const taxes = Math.round(afterDiscount * 0.05) // 5% GST on discounted amount
        const total = afterDiscount + taxes

        return { basePrice, roomUpgrade, addOnsTotal, subtotal, discount, taxes, total }
    }

    const pricing = calculateTotal()

    const handleNext = () => {
        onNext({
            totalAmount: pricing.total,
            basePrice: pricing.basePrice,
            taxes: pricing.taxes,
            discount: pricing.discount,
            couponCode: appliedCoupon?.code,
            couponDetails: appliedCoupon || undefined,
        })
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not selected'
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }

    return (
        <div className="space-y-4 sm:space-y-6">
            <div>
                <h3 className="text-xl sm:text-2xl font-bold text-neutral-900 mb-2">Review Your Booking</h3>
                <p className="text-sm sm:text-base text-neutral-600">Please review all details before proceeding to payment</p>
            </div>

            {/* Journey Details */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-neutral-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">Journey Details</h4>
                </div>
                <div className="space-y-3">
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-600">Journey</span>
                        <span className="text-sm font-bold text-neutral-900 text-right max-w-[60%]">{journey.title}</span>
                    </div>
                    <div className="h-px bg-neutral-100"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-600">Destination</span>
                        <span className="text-sm font-bold text-neutral-900">{journey.destination}</span>
                    </div>
                    <div className="h-px bg-neutral-100"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-600 flex items-center gap-1.5">
                            <Calendar className="w-4 h-4 text-primary-600" />
                            Departure
                        </span>
                        <span className="text-sm font-bold text-neutral-900 text-right">
                            {formatDate(bookingData.departureDate)}
                        </span>
                    </div>
                    <div className="h-px bg-neutral-100"></div>
                    <div className="flex justify-between items-center py-2">
                        <span className="text-sm text-neutral-600">Duration</span>
                        <span className="text-sm font-bold text-neutral-900">
                            {journey.duration?.days || journey.duration || 'N/A'} days
                        </span>
                    </div>
                </div>
            </div>

            {/* Travelers */}
            <div className="p-5 sm:p-6 bg-white rounded-2xl border-2 border-neutral-100 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b-2 border-neutral-100">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center">
                        <Users className="w-5 h-5 text-white" />
                    </div>
                    <h4 className="text-lg font-bold text-neutral-900">
                        Travelers ({bookingData.numberOfTravelers})
                    </h4>
                </div>
                <div className="space-y-3">
                    {bookingData.travelers?.map((traveler, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gradient-to-r from-neutral-50 to-primary-50/20 rounded-xl border border-neutral-100">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center shrink-0">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="text-sm font-bold text-neutral-900 truncate">{traveler.name}</div>
                                <div className="text-xs text-neutral-600">
                                    {traveler.age} years • {traveler.gender}
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="mt-3 pt-3 border-t border-neutral-100">
                        <div className="flex justify-between items-center">
                            <span className="text-sm text-neutral-600">Room Preference</span>
                            <span className="text-sm font-bold text-primary-600 capitalize">
                                {bookingData.roomPreference} Room
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add-Ons */}
            {bookingData.addOns && bookingData.addOns.length > 0 && (
                <div className="p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 mb-4">Add-Ons & Extras</h4>
                    <div className="space-y-2">
                        {bookingData.addOns.includes('insurance') && (
                            <div className="flex items-center gap-2 text-neutral-700">
                                <Shield className="w-4 h-4 text-primary-600" />
                                Travel Insurance
                            </div>
                        )}
                        {bookingData.addOns.includes('airportTransfer') && (
                            <div className="flex items-center gap-2 text-neutral-700">
                                <Car className="w-4 h-4 text-primary-600" />
                                Airport Transfer
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Special Requests */}
            {bookingData.specialRequests && (
                <div className="p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200">
                    <h4 className="font-bold text-neutral-900 mb-2">Special Requests</h4>
                    <p className="text-neutral-700 text-sm">{bookingData.specialRequests}</p>
                </div>
            )}

            {/* Price Breakdown */}
            <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-200">
                <h4 className="text-xl font-bold text-neutral-900 mb-4">Price Breakdown</h4>

                {/* Applied Coupon Display */}
                {appliedCoupon && (
                    <div className="mb-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Tag className="w-5 h-5 text-green-600" />
                                <div>
                                    <p className="font-bold text-green-900">{appliedCoupon.code} Applied!</p>
                                    <p className="text-sm text-green-700">You saved ₹{appliedCoupon.discount.toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    <div className="flex justify-between">
                        <span className="text-neutral-700">
                            Base Price ({bookingData.numberOfTravelers} travelers)
                        </span>
                        <span className="font-bold text-neutral-900">
                            ₹{pricing.basePrice.toLocaleString()}
                        </span>
                    </div>
                    {pricing.roomUpgrade > 0 && (
                        <div className="flex justify-between">
                            <span className="text-neutral-700">Single Room Upgrade</span>
                            <span className="font-bold text-neutral-900">
                                ₹{pricing.roomUpgrade.toLocaleString()}
                            </span>
                        </div>
                    )}
                    {pricing.addOnsTotal > 0 && (
                        <div className="flex justify-between">
                            <span className="text-neutral-700">Add-Ons</span>
                            <span className="font-bold text-neutral-900">
                                ₹{pricing.addOnsTotal.toLocaleString()}
                            </span>
                        </div>
                    )}
                    <div className="border-t border-neutral-300 my-2"></div>
                    <div className="flex justify-between text-base">
                        <span className="text-neutral-700 font-semibold">Subtotal</span>
                        <span className="font-bold text-neutral-900">
                            ₹{pricing.subtotal.toLocaleString()}
                        </span>
                    </div>
                    {pricing.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                            <span className="font-semibold">Discount</span>
                            <span className="font-bold">
                                - ₹{pricing.discount.toLocaleString()}
                            </span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-neutral-700">GST (5%)</span>
                        <span className="font-bold text-neutral-900">
                            ₹{pricing.taxes.toLocaleString()}
                        </span>
                    </div>
                    <div className="border-t-2 border-neutral-300 my-3"></div>
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-black text-neutral-900">Total Amount</span>
                        <span className="text-3xl font-black text-primary-600">
                            ₹{pricing.total.toLocaleString()}
                        </span>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="p-4 bg-neutral-50 rounded-xl text-xs text-neutral-600">
                <p className="mb-2">
                    <strong>Cancellation Policy:</strong> Free cancellation up to 30 days before
                    departure. 50% refund for cancellations 15-30 days before. No refund for
                    cancellations within 15 days.
                </p>
                <p>
                    By proceeding, you agree to our{' '}
                    <a href="/terms" className="text-primary-600 hover:underline">
                        Terms & Conditions
                    </a>{' '}
                    and{' '}
                    <a href="/privacy" className="text-primary-600 hover:underline">
                        Privacy Policy
                    </a>
                    .
                </p>
            </div>

            {/* Navigation */}
            <div className="flex flex-col gap-3 pt-4">
                <Button onClick={handleNext} size="lg" className="w-full">
                    Proceed to Payment →
                </Button>
                <Button variant="outline" onClick={onBack} className="w-full">
                    ← Back
                </Button>
            </div>
        </div>
    )
}
