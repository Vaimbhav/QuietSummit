import { useState, useEffect } from 'react'
import { Shield, Car, Plus, Tag, X, Percent, Gift } from 'lucide-react'
import Button from '../../common/Button'
import TextArea from '../../common/TextArea'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'
import { getActiveCoupons, validateCoupon } from '../../../services/api'

interface AddOnsStepProps {
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

export default function AddOnsStep({ journey, bookingData, onNext, onBack }: AddOnsStepProps) {
    const [selectedAddOns, setSelectedAddOns] = useState<string[]>(bookingData.addOns || [])
    const [specialRequests, setSpecialRequests] = useState(bookingData.specialRequests || '')
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
                console.log('Fetching coupons from API...')
                const response = await getActiveCoupons()
                console.log('API Response:', response)

                if (response.success && response.data) {
                    console.log('Coupons loaded:', response.data.length)
                    setAvailableCoupons(response.data)
                } else {
                    console.warn('No coupons in response or success is false:', response)
                    setAvailableCoupons([])
                }
            } catch (error: any) {
                console.error('Error fetching coupons:', error)
                console.error('Error details:', error.response?.data || error.message)
                setAvailableCoupons([])
            } finally {
                setIsLoadingCoupons(false)
            }
        }

        fetchCoupons()
    }, [])

    const addOns = [
        {
            id: 'insurance',
            name: 'Travel Insurance',
            description: 'Comprehensive travel insurance coverage',
            price: 500,
            icon: Shield,
            perPerson: true,
        },
        {
            id: 'airportTransfer',
            name: 'Airport Transfer',
            description: 'Round-trip airport pickup and drop-off',
            price: 1500,
            icon: Car,
            perPerson: false,
        },
    ]

    const toggleAddOn = (id: string) => {
        setSelectedAddOns((prev) =>
            prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
        )
    }

    const calculateAddOnsTotal = () => {
        let total = 0
        selectedAddOns.forEach((addOnId) => {
            const addOn = addOns.find((a) => a.id === addOnId)
            if (addOn) {
                total += addOn.perPerson ? addOn.price * (bookingData.numberOfTravelers || 1) : addOn.price
            }
        })
        return total
    }

    const calculateSubtotal = () => {
        const basePrice = journey.basePrice * (bookingData.numberOfTravelers || 1)
        const roomUpgrade =
            bookingData.roomPreference === 'single'
                ? 2000 * (bookingData.numberOfTravelers || 1)
                : 0
        const addOnsTotal = calculateAddOnsTotal()
        return basePrice + roomUpgrade + addOnsTotal
    }

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
                subtotal: calculateSubtotal(),
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
            addOns: selectedAddOns,
            specialRequests,
            addOnsTotal: calculateAddOnsTotal(),
            couponCode: appliedCoupon?.code,
            couponDetails: appliedCoupon || undefined,
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">
                    Enhance Your Experience
                </h3>
                <p className="text-neutral-600">Add optional services to your journey</p>
            </div>

            {/* Add-Ons */}
            <div className="space-y-4">
                {addOns.map((addOn) => {
                    const Icon = addOn.icon
                    const isSelected = selectedAddOns.includes(addOn.id)
                    const price = addOn.perPerson
                        ? addOn.price * (bookingData.numberOfTravelers || 1)
                        : addOn.price

                    return (
                        <button
                            key={addOn.id}
                            onClick={() => toggleAddOn(addOn.id)}
                            className={`w-full p-6 rounded-2xl border-2 transition-all text-left ${isSelected
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 hover:border-primary-200'
                                }`}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className={`w-12 h-12 rounded-xl flex items-center justify-center ${isSelected ? 'bg-primary-600' : 'bg-neutral-200'
                                        }`}
                                >
                                    <Icon
                                        className={`w-6 h-6 ${isSelected ? 'text-white' : 'text-neutral-600'
                                            }`}
                                    />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                        <h4 className="text-lg font-bold text-neutral-900">
                                            {addOn.name}
                                        </h4>
                                        <span className="text-xl font-bold text-primary-600">
                                            ₹{price.toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-neutral-600">{addOn.description}</p>
                                    {addOn.perPerson && (
                                        <p className="text-xs text-neutral-500 mt-1">
                                            ₹{addOn.price} per person
                                        </p>
                                    )}
                                </div>
                                <div
                                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${isSelected
                                        ? 'border-primary-600 bg-primary-600'
                                        : 'border-neutral-300'
                                        }`}
                                >
                                    {isSelected && <Plus className="w-4 h-4 text-white rotate-45" />}
                                </div>
                            </div>
                        </button>
                    )
                })}
            </div>

            {/* Coupons Section */}
            <div className="p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl border-2 border-primary-200">
                <h4 className="text-lg sm:text-xl font-bold text-neutral-900 mb-4">Apply Coupon</h4>

                {!appliedCoupon ? (
                    <div>
                        {/* Available Coupons */}
                        <div className="mb-4">
                            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <Gift className="w-5 h-5 text-primary-600" />
                                    <h5 className="font-bold text-neutral-900 text-sm sm:text-base">Available Offers</h5>
                                    {availableCoupons.length > 0 && (
                                        <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full font-semibold">
                                            {availableCoupons.length} {availableCoupons.length === 1 ? 'offer' : 'offers'}
                                        </span>
                                    )}
                                </div>
                                {availableCoupons.length > 2 && (
                                    <button
                                        onClick={() => setShowAllCoupons(!showAllCoupons)}
                                        className="text-xs sm:text-sm text-primary-600 font-semibold hover:text-primary-700"
                                    >
                                        {showAllCoupons ? 'Show Less' : 'View All'}
                                    </button>
                                )}
                            </div>

                            {/* Loading State */}
                            {isLoadingCoupons ? (
                                <div className="text-center py-8 text-neutral-500">
                                    <div className="animate-pulse">Loading available offers...</div>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {availableCoupons.length === 0 ? (
                                        <div className="text-center py-6 text-neutral-500 bg-neutral-50 rounded-lg border-2 border-dashed border-neutral-200">
                                            <Gift className="w-8 h-8 mx-auto mb-2 text-neutral-400" />
                                            <p className="text-sm font-medium">No coupons available at the moment</p>
                                            <p className="text-xs mt-1">Check back later for exciting offers!</p>
                                        </div>
                                    ) : (
                                        (showAllCoupons ? availableCoupons : availableCoupons.slice(0, 2)).map((coupon, index) => {
                                            const Icon = getIconForCoupon(coupon.discountType)
                                            const subtotal = calculateSubtotal()
                                            const isEligible = subtotal >= coupon.minPurchase
                                            const color = colorPalette[index % colorPalette.length]

                                            // Format title based on discount type
                                            const title = coupon.discountType === 'percentage'
                                                ? `${coupon.discountValue}% OFF`
                                                : `₹${coupon.discountValue.toLocaleString()} OFF`

                                            const isApplied = appliedCoupon?.code === coupon.code

                                            return (
                                                <div
                                                    key={coupon._id}
                                                    className={`relative overflow-hidden rounded-xl border-2 ${isApplied
                                                        ? 'border-green-400 bg-green-50'
                                                        : isEligible
                                                            ? 'border-primary-200 bg-white hover:border-primary-400 cursor-pointer'
                                                            : 'border-neutral-200 bg-neutral-50 opacity-60'
                                                        } transition-all`}
                                                >
                                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3">
                                                        <div className="flex items-center gap-3 w-full sm:flex-1">
                                                            {/* Coupon Badge */}
                                                            <div className={`${color} text-white px-3 py-2 sm:px-4 sm:py-3 rounded-lg flex items-center justify-center min-w-[70px] sm:min-w-[80px] shrink-0`}>
                                                                <div className="text-center">
                                                                    <Icon className="w-4 h-4 sm:w-5 sm:h-5 mx-auto mb-1" />
                                                                    <p className="text-xs sm:text-sm font-black whitespace-nowrap">{title}</p>
                                                                </div>
                                                            </div>

                                                            {/* Coupon Details */}
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-bold text-neutral-900 text-sm truncate">{coupon.code}</p>
                                                                <p className="text-xs text-neutral-600 truncate">
                                                                    {coupon.description || 'Special Offer'}
                                                                </p>
                                                                {!isEligible && (
                                                                    <p className="text-xs text-red-600 mt-1 truncate">
                                                                        Add ₹{(coupon.minPurchase - subtotal).toLocaleString()} more
                                                                    </p>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Apply Button */}
                                                        <button
                                                            onClick={() => isEligible && !isApplied && handleApplyCoupon(coupon.code)}
                                                            disabled={!isEligible || isApplyingCoupon || isApplied}
                                                            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-semibold text-sm transition-all shrink-0 ${isApplied
                                                                ? 'bg-green-600 text-white'
                                                                : isEligible
                                                                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                                                                    : 'bg-neutral-300 text-neutral-500 cursor-not-allowed'
                                                                }`}
                                                        >
                                                            {isApplied ? 'Applied' : 'Apply'}
                                                        </button>
                                                    </div>

                                                    {/* Dotted Border Effect - Hidden on mobile */}
                                                    <div className="hidden sm:block absolute top-0 right-[90px] bottom-0 w-4 overflow-hidden">
                                                        <div className="absolute inset-0 border-l-2 border-dashed border-neutral-300"></div>
                                                    </div>
                                                </div>
                                            )
                                        })
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Manual Coupon Input */}
                        <div className="p-3 sm:p-4 bg-white rounded-xl border border-neutral-200">
                            <div className="flex items-center gap-2 mb-2">
                                <Tag className="w-4 h-4 sm:w-5 sm:h-5 text-primary-600" />
                                <h5 className="font-bold text-neutral-900 text-sm sm:text-base">Have a Coupon Code?</h5>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input
                                    type="text"
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                    placeholder="Enter coupon code"
                                    className="flex-1 px-3 sm:px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm sm:text-base"
                                    disabled={isApplyingCoupon}
                                />
                                <Button
                                    onClick={() => handleApplyCoupon()}
                                    variant="primary"
                                    size="sm"
                                    disabled={isApplyingCoupon || !couponCode.trim()}
                                    isLoading={isApplyingCoupon}
                                    className="w-full sm:w-auto"
                                >
                                    Apply
                                </Button>
                            </div>
                            {couponError && (
                                <p className="text-red-600 text-sm mt-2">{couponError}</p>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="p-4 bg-green-50 rounded-xl border-2 border-green-200">
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
            </div>

            {/* Special Requests */}
            <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3">
                    Special Requests (Optional)
                </label>
                <TextArea
                    value={specialRequests}
                    onChange={(e) => setSpecialRequests(e.target.value)}
                    placeholder="Any dietary requirements, medical conditions, or special requests we should know about..."
                    rows={4}
                />
                <p className="text-xs text-neutral-500 mt-2">
                    Let us know about any special needs or preferences
                </p>
            </div>

            {/* Add-Ons Summary */}
            {selectedAddOns.length > 0 && (
                <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl">
                    <h4 className="font-bold text-neutral-900 mb-3">Add-Ons Summary</h4>
                    {selectedAddOns.map((addOnId) => {
                        const addOn = addOns.find((a) => a.id === addOnId)
                        if (!addOn) return null
                        const price = addOn.perPerson
                            ? addOn.price * (bookingData.numberOfTravelers || 1)
                            : addOn.price

                        return (
                            <div key={addOnId} className="flex justify-between items-center mb-2">
                                <span className="text-neutral-700">{addOn.name}</span>
                                <span className="font-bold text-neutral-900">
                                    ₹{price.toLocaleString()}
                                </span>
                            </div>
                        )
                    })}
                    <div className="border-t border-neutral-300 my-3"></div>
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-neutral-900">Total Add-Ons</span>
                        <span className="text-xl font-black text-primary-600">
                            ₹{calculateAddOnsTotal().toLocaleString()}
                        </span>
                    </div>
                </div>
            )}

            {/* Navigation */}
            <div className="flex flex-col gap-3 pt-4">
                <Button onClick={handleNext} size="lg" className="w-full">
                    Continue to Review →
                </Button>
                <Button variant="outline" onClick={onBack} className="w-full">
                    ← Back
                </Button>
            </div>
        </div>
    )
}
