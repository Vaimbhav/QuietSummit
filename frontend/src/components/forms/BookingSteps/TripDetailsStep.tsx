import { useState } from 'react'
import { Calendar, Users } from 'lucide-react'
import Button from '../../common/Button'
import { Journey } from '../../../types/journey'
import { BookingData } from '../BookingForm'

interface TripDetailsStepProps {
    journey: Journey
    bookingData: Partial<BookingData>
    onNext: (data: Partial<BookingData>) => void
}

export default function TripDetailsStep({ journey, bookingData, onNext }: TripDetailsStepProps) {
    const [selectedDate, setSelectedDate] = useState(bookingData.departureDate || '')
    const [travelers, setTravelers] = useState(bookingData.numberOfTravelers || 1)
    const [roomPreference, setRoomPreference] = useState<'single' | 'double' | 'triple'>(
        bookingData.roomPreference || 'double'
    )

    const departureDates = journey.departureDates || []

    const handleNext = () => {
        if (!selectedDate) {
            alert('Please select a departure date')
            return
        }

        onNext({
            departureDate: selectedDate,
            numberOfTravelers: travelers,
            roomPreference,
        })
    }

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-2xl font-bold text-neutral-900 mb-2">Select Your Trip Details</h3>
                <p className="text-neutral-600">
                    Choose your preferred departure date and number of travelers
                </p>
            </div>

            {/* Departure Dates */}
            <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary-600" />
                    Available Departure Dates
                </label>

                {/* Mobile Dropdown */}
                <div className="md:hidden relative">
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className={`w-full px-5 py-4 rounded-xl border-2 transition-all appearance-none cursor-pointer font-semibold text-base ${selectedDate
                                ? 'border-primary-500 bg-gradient-to-r from-primary-50 to-accent-50 text-primary-900'
                                : 'border-neutral-300 bg-white text-neutral-600 hover:border-primary-300'
                            } focus:border-primary-500 focus:ring-4 focus:ring-primary-100 focus:outline-none shadow-sm hover:shadow-md`}
                    >
                        <option value="" className="text-neutral-600">Select a departure date</option>
                        {departureDates.map((date) => {
                            const dateObj = new Date(date)
                            const formatted = dateObj.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })
                            return (
                                <option key={date} value={date} className="text-neutral-900 py-2">
                                    {formatted} • {journey.duration.days} days
                                </option>
                            )
                        })}
                    </select>
                    {/* Custom Dropdown Arrow */}
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className={`w-5 h-5 transition-colors ${selectedDate ? 'text-primary-600' : 'text-neutral-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </div>

                {/* Desktop Cards */}
                <div className="hidden md:grid md:grid-cols-2 gap-3">
                    {departureDates.length > 0 ? (
                        departureDates.map((date) => {
                            const dateObj = new Date(date)
                            const formatted = dateObj.toLocaleDateString('en-US', {
                                month: 'long',
                                day: 'numeric',
                                year: 'numeric',
                            })

                            return (
                                <button
                                    key={date}
                                    onClick={() => setSelectedDate(date)}
                                    className={`p-4 rounded-xl border-2 text-left transition-all ${selectedDate === date
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-neutral-200 hover:border-primary-200'
                                        }`}
                                >
                                    <div className="font-bold text-neutral-900">{formatted}</div>
                                    <div className="text-sm text-neutral-600">
                                        {journey.duration.days} days • Available
                                    </div>
                                </button>
                            )
                        })
                    ) : (
                        <div className="col-span-2 p-6 text-center text-neutral-500 bg-neutral-50 rounded-xl">
                            No departure dates available
                        </div>
                    )}
                </div>
            </div>

            {/* Number of Travelers */}
            <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary-600" />
                    Number of Travelers
                </label>
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setTravelers(Math.max(1, travelers - 1))}
                        className="w-12 h-12 rounded-xl border-2 border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-all font-bold text-xl"
                    >
                        −
                    </button>
                    <div className="flex-1 text-center">
                        <div className="text-4xl font-black text-primary-600">{travelers}</div>
                        <div className="text-sm text-neutral-600">
                            {travelers === 1 ? 'Traveler' : 'Travelers'}
                        </div>
                    </div>
                    <button
                        onClick={() => setTravelers(Math.min(10, travelers + 1))}
                        className="w-12 h-12 rounded-xl border-2 border-neutral-300 hover:border-primary-500 hover:bg-primary-50 transition-all font-bold text-xl"
                    >
                        +
                    </button>
                </div>
            </div>

            {/* Room Preference */}
            <div>
                <label className="block text-sm font-bold text-neutral-700 mb-3">
                    Room Preference
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                    {(['single', 'double', 'triple'] as const).map((type) => (
                        <button
                            key={type}
                            onClick={() => setRoomPreference(type)}
                            className={`p-4 rounded-xl border-2 transition-all ${roomPreference === type
                                ? 'border-primary-500 bg-primary-50'
                                : 'border-neutral-200 hover:border-primary-200'
                                }`}
                        >
                            <div className="font-bold text-neutral-900 capitalize">{type} Room</div>
                            <div className="text-sm text-neutral-600">
                                {type === 'single' && '+ ₹2,000/person'}
                                {type === 'double' && 'Included'}
                                {type === 'triple' && 'Included'}
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Price Summary */}
            <div className="p-6 bg-gradient-to-br from-primary-50 to-accent-50 rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-neutral-700">Base Price</span>
                    <span className="font-bold text-neutral-900">
                        ₹{(journey.basePrice * travelers).toLocaleString()}
                    </span>
                </div>
                {roomPreference === 'single' && (
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-neutral-700">Single Room Upgrade</span>
                        <span className="font-bold text-neutral-900">
                            + ₹{(2000 * travelers).toLocaleString()}
                        </span>
                    </div>
                )}
                <div className="border-t border-neutral-300 my-3"></div>
                <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-neutral-900">Subtotal</span>
                    <span className="text-2xl font-black text-primary-600">
                        ₹
                        {(
                            journey.basePrice * travelers +
                            (roomPreference === 'single' ? 2000 * travelers : 0)
                        ).toLocaleString()}
                    </span>
                </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-end gap-3 pt-4">
                <Button onClick={handleNext} size="lg">
                    Continue to Traveler Details →
                </Button>
            </div>
        </div>
    )
}
