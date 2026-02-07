import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Calendar, Users, AlertCircle } from 'lucide-react';
import PhoneInput from '../common/PhoneInput';

interface Guest {
    name: string;
    age: string | number;
    gender: 'male' | 'female' | 'other';
    phone: string;
    phoneCountryCode?: string;
    email?: string;
}

interface GuestInformationFormProps {
    guests: number;
    checkIn: string;
    checkOut: string;
    initialData: {
        primaryGuest: any;
        additionalGuests: any[];
        specialRequests: any;
    };
    onNext: (data: any) => void;
    onBack?: () => void;
}

export default function GuestInformationForm({
    guests,
    checkIn,
    checkOut,
    initialData,
    onNext,
    onBack,
}: GuestInformationFormProps) {
    // Traveler count is FIXED based on the initial query - cannot be changed
    const numberOfTravelers = guests;

    const [travelers, setTravelers] = useState<Guest[]>(() => {
        const all: Guest[] = [];
        // Primary Guest (Lead)
        all.push({
            name: initialData.primaryGuest?.name || '',
            age: initialData.primaryGuest?.age || '',
            gender: initialData.primaryGuest?.gender || 'male',
            phone: initialData.primaryGuest?.phone || '',
            email: initialData.primaryGuest?.email || '',
            phoneCountryCode: ''
        });

        // Additional Guests from initial data
        // We use Math.max(0, guests - 1) to account for lead guest
        const additionalCount = Math.max(0, guests - 1);
        for (let i = 0; i < additionalCount; i++) {
            const existing = initialData.additionalGuests?.[i];
            all.push({
                name: existing?.name || '',
                age: existing?.age || '',
                gender: existing?.gender || 'male',
                phone: existing?.phone || '',
                phoneCountryCode: ''
            });
        }
        return all;
    });

    const [specialRequestsData, setSpecialRequestsData] = useState(initialData.specialRequests || {
        arrivalTime: '',
        requests: '',
        tripPurpose: ''
    });

    const updateTraveler = (index: number, field: keyof Guest, value: any) => {
        setTravelers(prev => {
            const newTravelers = [...prev];
            newTravelers[index] = { ...newTravelers[index], [field]: value };
            return newTravelers;
        });
    };

    const handleContinue = () => {
        // Validation
        for (let i = 0; i < travelers.length; i++) {
            if (!travelers[i].name || !travelers[i].age) {
                alert(`Please fill all details for Guest ${i + 1}`);
                return;
            }
            // Strict check for lead guest
            if (i === 0) {
                if (!travelers[i].phone) {
                    alert(`Please provide a phone number for the Lead Guest`);
                    return;
                }
                if (!travelers[i].email) {
                    alert(`Please provide an email for the Lead Guest`);
                    return;
                }
            }
        }

        onNext({
            primaryGuest: {
                ...travelers[0],
                email: travelers[0].email,
            },
            additionalGuests: travelers.slice(1),
            specialRequests: specialRequestsData
        });
    };

    // Format dates for display
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        return new Date(dateStr).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric'
        });
    };

    return (
        <div className="flex flex-col h-full bg-[#0b1224] min-h-[inherit]">
            <div className="flex-1 p-4 md:p-8 space-y-8 overflow-y-auto pb-20">

                {/* Trip Schedule Section */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-full bg-teal-500/10">
                            <div className="w-1.5 h-1.5 rounded-full bg-teal-400"></div>
                        </div>
                        <h3 className="text-sm sm:text-base font-semibold text-slate-200">Trip Schedule</h3>
                    </div>

                    <div className="rounded-xl p-3 md:p-4" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center gap-3 flex-1">
                                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                    <Calendar className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Check-in</p>
                                    <p className="text-white font-bold text-base">{formatDate(checkIn)}</p>
                                </div>
                            </div>
                            <div className="hidden md:block w-px bg-white/10"></div>
                            <div className="flex items-center gap-3 flex-1">
                                <div className="p-2.5 rounded-lg bg-teal-500/10 border border-teal-500/20">
                                    <Calendar className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">Check-out</p>
                                    <p className="text-white font-bold text-base">{formatDate(checkOut)}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Total Travelers Display (Fixed) */}
                <div className="rounded-2xl p-3 md:p-4" style={{ background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', border: '1px solid rgba(92, 225, 230, 0.2)' }}>
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 rounded-xl" style={{ background: 'rgba(92, 225, 230, 0.15)' }}>
                                <Users className="w-5 h-5 text-teal-400" />
                            </div>
                            <div>
                                <h3 className="text-sm sm:text-base font-bold text-slate-100">Total Travelers</h3>
                                <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5">Based on your availability check</p>
                            </div>
                        </div>

                        <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(92, 225, 230, 0.15)', border: '1px solid rgba(92, 225, 230, 0.3)' }}>
                            <span className="text-xl sm:text-2xl font-black text-teal-400">{numberOfTravelers}</span>
                            <span className="text-[10px] sm:text-xs text-slate-300 uppercase tracking-wider font-semibold">Guest{numberOfTravelers > 1 ? 's' : ''}</span>
                        </div>
                    </div>
                </div>

                {/* Guest Details Section */}
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-200 px-1">Traveler Details</h3>

                    {travelers.map((traveler, index) => (
                        <div key={index} className="rounded-xl p-4 md:p-6 space-y-5" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                            <div className="flex items-center justify-between border-b border-white/5 pb-4">
                                <h4 className="text-sm font-bold flex items-center gap-3 text-slate-100">
                                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-teal-500/10 text-teal-400 text-xs font-bold ring-1 ring-teal-500/20">
                                        {index + 1}
                                    </span>
                                    {index === 0 ? 'Traveler Information' : 'Traveler Information'}
                                </h4>
                                {index === 0 && (
                                    <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded bg-teal-500 text-white tracking-wide shadow-lg shadow-teal-500/20">
                                        Lead Guest
                                    </span>
                                )}
                            </div>

                            <div className="grid md:grid-cols-2 gap-5">
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Name <span className="text-red-400">*</span></label>
                                    <input
                                        value={traveler.name}
                                        onChange={(e) => updateTraveler(index, 'name', e.target.value)}
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                    />
                                </div>

                                {/* Email for Lead Guest Only - Same as in Screenshot, implied or explicit */}
                                <div>
                                    <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">
                                        {index === 0 ? <>Email <span className="text-red-400">*</span></> : 'Email (Optional)'}
                                    </label>
                                    <input
                                        type="email"
                                        value={traveler.email || ''}
                                        onChange={(e) => updateTraveler(index, 'email', e.target.value)}
                                        placeholder="john@example.com"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Age <span className="text-red-400">*</span></label>
                                        <input
                                            type="number"
                                            value={traveler.age}
                                            onChange={(e) => updateTraveler(index, 'age', e.target.value)}
                                            placeholder="25"
                                            min="1"
                                            max="120"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Gender <span className="text-red-400">*</span></label>
                                        <div className="relative">
                                            <select
                                                value={traveler.gender}
                                                onChange={(e) => updateTraveler(index, 'gender', e.target.value as any)}
                                                className="appearance-none w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm cursor-pointer"
                                            >
                                                <option value="male" className="bg-slate-900">Male</option>
                                                <option value="female" className="bg-slate-900">Female</option>
                                                <option value="other" className="bg-slate-900">Other</option>
                                            </select>
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                                <ChevronDown className="w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="md:col-span-2">
                                    <PhoneInput
                                        value={traveler.phone}
                                        onChange={(phone, countryCode) => {
                                            updateTraveler(index, 'phone', phone);
                                            updateTraveler(index, 'phoneCountryCode', countryCode);
                                        }}
                                        placeholder="Enter phone number"
                                        label="Phone Number"
                                        required={index === 0} // Mandatory only for lead guest
                                        darkMode={true}
                                    />
                                    {index === 0 && <p className="text-[10px] text-slate-500 mt-1.5 ml-0.5">We'll use this for booking updates.</p>}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Special Requests Section */}
                <div className="space-y-4 pt-6 border-t border-white/5">
                    <h3 className="text-lg font-semibold text-slate-200 px-1">Special Requests</h3>
                    <div className="rounded-xl p-4 md:p-6 space-y-5" style={{ background: 'rgba(255, 255, 255, 0.05)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255, 255, 255, 0.1)', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)' }}>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Expected Arrival Time</label>
                            <input
                                type="time"
                                value={specialRequestsData.arrivalTime}
                                onChange={(e) => setSpecialRequestsData({ ...specialRequestsData, arrivalTime: e.target.value })}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wide">Special Requirements / Notes</label>
                            <textarea
                                value={specialRequestsData.requests}
                                onChange={(e) => setSpecialRequestsData({ ...specialRequestsData, requests: e.target.value })}
                                placeholder="Any allergies, accessibility needs, or special occasions?"
                                rows={3}
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all text-sm resize-none"
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Fixed Bottom Bar */}
            <div className="px-3 md:px-6 py-4 sticky bottom-0 left-0 right-0 z-[100] w-full mt-auto backdrop-blur-md"
                style={{ background: 'rgba(15, 23, 42, 0.9)', borderTop: '1px solid rgba(92,225,230,0.1)' }}
            >
                <div className="flex gap-3 max-w-4xl mx-auto">
                    {onBack && (
                        <button
                            onClick={onBack}
                            className="h-12 px-6 flex items-center justify-center gap-2 rounded-2xl bg-white/5 border border-white/10 text-slate-300 hover:bg-white/10 active:scale-95 transition-all text-sm font-bold"
                        >
                            <ChevronLeft className="w-5 h-5" />
                            Back
                        </button>
                    )}
                    <button
                        onClick={handleContinue}
                        className="flex-1 text-white font-bold py-3.5 px-6 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-xl shadow-teal-500/20 active:scale-[0.98] text-sm md:text-base group hover:shadow-teal-500/30 overflow-hidden relative"
                        style={{ background: 'linear-gradient(90deg, #2dd4bf 0%, #0d9488 100%)' }}
                    >
                        {/* Shine Effect */}
                        <div className="absolute inset-0 opacity-20 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:animate-shine"></div>
                        <span className="relative z-10 flex items-center gap-2">
                            Review & Confirm
                            <ChevronRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
}
