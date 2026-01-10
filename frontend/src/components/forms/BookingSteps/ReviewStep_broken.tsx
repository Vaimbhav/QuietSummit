import { Calendar, Users, MapPin, User, Shield, Car, Tag, X, Percent, Gift, Sparkles } from 'lucide-react'
import { useState, useEffect } from 'react'
import Button from '../../common/Button'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { getActiveCoupons, validateCoupon } from '../../../services/api'

interface ReviewStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onNext: (data: Partial<BookingData>) => void
    onBack: () => void
}

interface CouponData {
    _id: string
    code: string
    discountType: 'percentage' | 'fixed'
    discountValue: number
    minPurchase: number
    maxDiscount?: number
    description?: string
}

// Color palette for coupon cards
const colorPalette = [
    'bg-gradient-to-br from-teal-500 to-cyan-500',
    'bg-gradient-to-br from-indigo-500 to-purple-500',
    'bg-gradient-to-br from-purple-500 to-pink-500',
    'bg-gradient-to-br from-orange-500 to-red-500',
    'bg-gradient-to-br from-blue-500 to-cyan-500',
    'bg-gradient-to-br from-green-500 to-emerald-500',
    'bg-gradient-to-br from-pink-500 to-rose-500',
    'bg-gradient-to-br from-amber-500 to-orange-500',
]

// Icon selection based on discount type
const getIconForCoupon = (discountType: string) => {
    return discountType === 'percentage' ? Percent : Gift
}

export default function ReviewStep({ journey, bookingData, onNext, onBack }: ReviewStepProps) {
    const [couponCode, setCouponCode] = useState(bookingData.couponCode || '')
    const [appliedCoupon, setAppliedCoupon] = useState(bookingData.couponDetails || null)
    const [couponError, setCouponError] = useState('')
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)
    const [showAllCoupons, setShowAllCoupons] = useState(false)
    const [availableCoupons, setAvailableCoupons] = useState<CouponData[]>([])
    const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)

    // Fetch active coupons from database
    useEffect(() => {
        const fetchCoupons = async () => {
            try {
                setIsLoadingCoupons(true)
                const response = await getActiveCoupons()
                if (response.success) {
                    setAvailableCoupons(response.data)
                }
            } catch (error) {
                console.error('Error fetching coupons:', error)
            } finally {
                setIsLoadingCoupons(false)
            }
        }

        fetchCoupons()
    }, [])

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

    const handleApplyCoupon = async (selectedCode?: string) => {
        const codeToApply = selectedCode || couponCode.trim()

        if (!codeToApply) {
            setCouponError('Please enter a coupon code')
            return
        }

        setIsApplyingCoupon(true)
        setCouponError('')

        try {
            const response = await validateCoupon({
                code: codeToApply,
                journeyId: journey._id,
                subtotal: pricing.subtotal,
            })

            if (response.success) {
                setAppliedCoupon({
                    couponId: response.data.couponId,
                    code: response.data.code,
                    discount: response.data.discount,
                })
                setCouponCode(response.data.code)
                setCouponError('')
                setShowAllCoupons(false)
            }
        } catch (error: any) {
            setCouponError(error.response?.data?.message || 'Invalid coupon code')
            setAppliedCoupon(null)
        } finally {
            setIsApplyingCoupon(false)
        }
    }

    const handleRemoveCoupon = () => {
        setAppliedCoupon(null)
        setCouponCode('')
        setCouponError('')
    }

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
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Review Your Booking</h3>
                <p className="text-neutral-600">Please review all details before proceeding to payment</p>
            </div>

            {/* Journey Details */}
            <div className="p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary-600" />
                    Journey Details
                </h4>
                <div className="space-y-3">
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Journey</span>
                        <span className="font-bold text-neutral-900">{journey.title}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Destination</span>
                        <span className="font-bold text-neutral-900">{journey.destination}</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-700 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Departure Date
                        </span>
                        <span className="font-bold text-neutral-900">
                            {formatDate(bookingData.departureDate)}
                        </span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Duration</span>
                        <span className="font-bold text-neutral-900">{journey.duration.days} days</span>
                    </div>
                </div>
            </div>

            {/* Travelers */}
            <div className="p-6 bg-gradient-to-br from-neutral-50 to-primary-50/30 rounded-2xl border border-neutral-200">
                <h4 className="font-bold text-neutral-900 mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    Travelers ({bookingData.numberOfTravelers})
                </h4>
                <div className="space-y-3">
                    {bookingData.travelers?.map((traveler, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg">
                            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-primary-600" />
                            </div>
                            <div className="flex-1">
                                <div className="font-bold text-neutral-900">{traveler.name}</div>
                                <div className="text-sm text-neutral-600">
                                    {traveler.age} years • {traveler.gender}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-3 p-3 bg-white rounded-lg">
                    <div className="flex justify-between">
                        <span className="text-neutral-700">Room Preference</span>
                        <span className="font-bold text-neutral-900 capitalize">
                            {bookingData.roomPreference} Room
                        </span>
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

                {/* Coupon Code Section */}
                {!appliedCoupon ? (
                    <div className="mb-4">
                        {/* Available Coupons */}
                        <div className="mb-4">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <Gift className="w-5 h-5 text-primary-600" />
                                    <h5 className="font-bold text-neutral-900">Available Offers</h5>
                                </div>
                                <button
                                    onClick={() => setShowAllCoupons(!showAllCoupons)}
                                    className="text-sm text-primary-600 font-semibold hover:text-primary-700"
                                >
                                    {showAllCoupons ? 'Hide' : 'View All'}
                                </button>
                            </div>

                            {/* Coupon Cards */}
                            <div className="space-y-2">
                                {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 2)).map((coupon) => {
                                    const Icon = coupon.icon
                                    const isEligible = pricing.subtotal >= coupon.minAmount

                                    return (
                                        <div
                                            key={coupon.code}
                                            className={`relative overflow-hidden rounded-xl border-2 ${isEligible
                                                ? 'border-primary-200 bg-white hover:border-primary-400 cursor-pointer'
                                                : 'border-neutral-200 bg-neutral-50 opacity-60'
                                                } transition-all`}
                                        >
                                            <div className="flex items-center gap-3 p-3">
                                                {/* Coupon Badge */}
                                                <div className={`${coupon.color} text-white px-4 py-3 rounded-lg flex items-center justify-center min-w-[80px]`}>
                                                    <div className="text-center">
                                                        {availableCoupons.length > 0 && (
                                                            <div className="mb-4">
                                                                <div className="flex items-center justify-between mb-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Gift className="w-5 h-5 text-primary-600" />
                                                                        <h5 className="font-bold text-neutral-900">Available Offers</h5>
                                                                    </div>
                                                                    {availableCoupons.length > 2 && (
                                                                        <button
                                                                            onClick={() => setShowAllCoupons(!showAllCoupons)}
                                                                            className="text-sm text-primary-600 font-semibold hover:text-primary-700"
                                                                        >
                                                                            {showAllCoupons ? 'Hide' : 'View All'}
                                                                        </button>
                                                                    )}
                                                                </div>

                                                                {/* Loading State */}
                                                                {isLoadingCoupons ? (
                                                                    <div className="text-center py-8 text-neutral-500">
                                                                        Loading available offers...
                                                                    </div>
                                                                ) : (
                                                                    /* Coupon Cards */
                                                                    <div className="space-y-2">
                                                                        {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 2)).map((coupon, index) => {
                                                                            const Icon = getIconForCoupon(coupon.discountType)
                                                                            const isEligible = pricing.subtotal >= coupon.minPurchase
                                                                            const color = colorPalette[index % colorPalette.length]

                                                                            // Format title based on discount type
                                                                            const title = coupon.discountType === 'percentage'
                                                                                ? `${coupon.discountValue}% OFF`
                                                                                : `₹${coupon.discountValue.toLocaleString()} OFF`

                                                                            return (
                                                                                <div
                                                                                    key={coupon._id}
                                                                                    className={`relative overflow-hidden rounded-xl border-2 ${isEligible
                                                                                        ? 'border-primary-200 bg-white hover:border-primary-400 cursor-pointer'
                                                                                        : 'border-neutral-200 bg-neutral-50 opacity-60'
                                                                                        } transition-all`}
                                                                                >
                                                                                    <div className="flex items-center gap-3 p-3">
                                                                                        {/* Coupon Badge */}
                                                                                        <div className={`${color} text-white px-4 py-3 rounded-lg flex items-center justify-center min-w-[80px]`}>
                                                                                            <div className="text-center">
                                                                                                <Icon className="w-5 h-5 mx-auto mb-1" />
                                                                                                <p className="text-sm font-black">{title}</p>
                                                                                            </div>
                                                                                        </div>

                                                                                        {/* Coupon Details */}
                                                                                        <div className="flex-1">
                                                                                            <p className="font-bold text-neutral-900 text-sm">{coupon.code}</p>
                                                                                            <p className="text-xs text-neutral-600">
                                                                                                {coupon.description || 'Special Offer'}
                                                                                            </p>
                                                                                            {!isEligible && (
                                                                                                <p className="text-xs text-red-600 mt-1">
                                                                                                    Add ₹{(coupon.minPurchase - pricing.subtotal).toLocaleString()} more
                                                                                                </p>
                                                                                            )}
                                                                                        </div>

                                                                                        {/* Apply Button */}
                                                                                        <button
                                                                                            onClick={() => isEligible && handleApplyCoupon(coupon.code)}
                                                                                            disabled={!isEligible || isApplyingCoupon}
                                                                                            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${isEligible
                                                                                                ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                                                                : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                                                                                }`}
                                                                                        >
                                                                                            Apply
                                                                                        </button>
                                                                                    </div>

                                                                                    {/* Dotted Border Effect */}
                                                                                    <div className="absolute top-0 right-20 bottom-0 w-4 overflow-hidden">
                                                                                        <div className="absolute inset-0 border-l-2 border-dashed border-neutral-300"></div>
                                                                                    </div>
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                        <div className="mb-4 p-4 bg-green-50 rounded-xl border-2 border-green-200">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <Tag className="w-5 h-5 text-green-600" />
                                                                    <div>
                                                                        <p className="font-bold text-green-900">{appliedCoupon.code} Applied!</p>
                                                                        <p className="text-sm text-green-700">You saved ₹{appliedCoupon.discount.toLocaleString()}</p>
                                                                    </div>
                                                                </div>
                                                                <button
                                                                    onClick={handleRemoveCoupon}
                                                                    className="p-2 hover:bg-green-100 rounded-full transition-colors"
                                                                >
                                                                    <X className="w-5 h-5 text-green-700" />
                                                                </button>
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
                                                    <div className="flex justify-between gap-3 pt-4">
                                                        <Button variant="outline" onClick={onBack}>
                                                            ← Back
                                                        </Button>
                                                        <Button onClick={handleNext} size="lg">
                                                            Proceed to Payment →
                                                        </Button>
                                                    </div>
                                                </div>
                                                )
