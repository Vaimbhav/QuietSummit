import { Calendar, Users, MapPin, DollarSign, Sparkles } from 'lucide-react'
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
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Not selected'
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'long',
            day: 'numeric',
            year: 'numeric',
        })
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
        }).format(amount)
    }

    return (
        <div className="space-y-6 md:space-y-8 pb-6">
            {/* Journey Overview */}
            <div className="relative bg-gradient-to-br from-primary-600 via-accent-600 to-primary-700 rounded-[2rem] p-6 md:p-10 text-white overflow-hidden shadow-2xl group hover:shadow-3xl transition-all duration-500">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/20 transition-all duration-700"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24 blur-2xl group-hover:bg-white/15 transition-all duration-700"></div>

                <div className="relative">
                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-6 mb-8">
                        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                            <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                        <div>
                            <p className="text-white/80 text-sm font-medium tracking-wide uppercase mb-1">{journey.destination}</p>
                            <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">{journey.title}</h3>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all duration-300">
                            <Calendar className="w-6 h-6 mb-3 text-white/90" />
                            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-1">Departure</p>
                            <p className="font-bold text-lg">{formatDate(bookingData.departureDate)}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-5 border border-white/10 hover:bg-white/20 transition-all duration-300">
                            <Users className="w-6 h-6 mb-3 text-white/90" />
                            <p className="text-xs text-white/70 uppercase tracking-wider font-semibold mb-1">Travelers</p>
                            <p className="font-bold text-lg">{bookingData.numberOfTravelers} {bookingData.numberOfTravelers === 1 ? 'Person' : 'People'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
                {/* Traveler Information */}
                <div className="bg-white rounded-[2rem] p-6 md:p-8 border-2 border-neutral-100 shadow-xl hover:shadow-2xl transition-all duration-300">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-100 to-accent-100 flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                            <h4 className="text-xl font-black text-neutral-900">Travelers</h4>
                            <p className="text-neutral-600 text-sm">Passenger details</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {bookingData.travelers?.map((traveler, index) => (
                            <div key={index} className="group bg-neutral-50 hover:bg-white rounded-2xl p-5 border border-neutral-200 hover:border-primary-200 hover:shadow-md transition-all duration-300">
                                <div className="flex items-center justify-between mb-4">
                                    <span className="font-bold text-neutral-900 flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-neutral-200 text-xs flex items-center justify-center text-neutral-600 font-black group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                            {index + 1}
                                        </div>
                                        {traveler.name}
                                    </span>
                                    {index === 0 && <span className="text-[10px] font-bold text-primary-700 bg-primary-50 border border-primary-100 px-2.5 py-1 rounded-full uppercase tracking-wide">Primary</span>}
                                </div>
                                <div className="grid grid-cols-2 gap-y-3 text-sm">
                                    <div className="flex flex-col">
                                        <span className="text-neutral-500 text-xs uppercase font-bold mb-0.5">Age / Gender</span>
                                        <span className="font-semibold text-neutral-900">{traveler.age} • <span className="capitalize">{traveler.gender}</span></span>
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-neutral-500 text-xs uppercase font-bold mb-0.5">Contact</span>
                                        <span className="font-semibold text-neutral-900 truncate">{traveler.emergencyContact}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Price Breakdown */}
                <div className="flex flex-col gap-6">
                    <div className="bg-gradient-to-br from-white to-neutral-50 rounded-[2rem] p-6 md:p-8 border-2 border-neutral-100 shadow-xl hover:shadow-2xl transition-all duration-300 h-full">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                                <DollarSign className="w-6 h-6 text-green-600" />
                            </div>
                            <div>
                                <h4 className="text-xl font-black text-neutral-900">Summary</h4>
                                <p className="text-neutral-600 text-sm">Cost breakdown</p>
                            </div>
                        </div>

                        <div className="space-y-5">
                            <div className="flex justify-between items-center py-2">
                                <span className="text-neutral-600 font-medium">Base Price <span className="text-xs text-neutral-400 block mt-0.5">({bookingData.numberOfTravelers} × {formatCurrency(journey.basePrice)})</span></span>
                                <span className="font-bold text-neutral-900 text-lg">{formatCurrency(bookingData.basePrice || 0)}</span>
                            </div>

                            <div className="flex justify-between items-center py-2">
                                <span className="text-neutral-600 font-medium">Taxes & Fees <span className="text-xs text-neutral-400 block mt-0.5">(18% GST included)</span></span>
                                <span className="font-bold text-neutral-900 text-lg">{formatCurrency(bookingData.taxes || 0)}</span>
                            </div>

                            <div className="h-px bg-gradient-to-r from-transparent via-neutral-200 to-transparent my-6"></div>

                            <div className="flex justify-between items-center bg-neutral-900 text-white p-6 rounded-2xl shadow-lg transform scale-105">
                                <span className="text-sm font-bold uppercase tracking-wider text-neutral-400">Total</span>
                                <span className="text-2xl md:text-3xl font-black">{formatCurrency(bookingData.totalAmount || 0)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-5 hover:bg-blue-50 transition-colors">
                        <h5 className="font-bold text-blue-900 mb-2 flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-blue-600" />
                            Important Info
                        </h5>
                        <ul className="text-xs md:text-sm text-blue-800 space-y-1.5 font-medium opacity-80 pl-6 list-disc">
                            <li>Please arrive 30 minutes before departure time</li>
                            <li>Carry valid government ID for all travelers</li>
                            <li>Free cancellation up to 7 days before departure</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6">
                <Button
                    onClick={onBack}
                    variant="outline"
                    size="lg"
                    className="flex-1 py-5 text-base font-bold rounded-2xl border-2 hover:bg-neutral-50 transition-colors"
                >
                    Back
                </Button>
                <Button
                    onClick={() => onNext(bookingData)}
                    size="lg"
                    className="flex-2 w-full py-5 text-base font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 bg-gradient-to-r from-primary-600 to-accent-600"
                >
                    Confirm & Pay {formatCurrency(bookingData.totalAmount || 0)}
                </Button>
            </div>
        </div>
    )
}
