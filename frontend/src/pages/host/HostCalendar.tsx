import { useState, useEffect } from 'react';
import { getHostProperties } from '@/services/hostApi';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Loader from '@components/common/Loader';

export default function HostCalendar() {
    const [properties, setProperties] = useState<any[]>([]);
    const [selectedProperty, setSelectedProperty] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        setLoading(true);
        try {
            // Backend uses 'approved' for active properties
            const data = await getHostProperties({ status: 'approved' });
            setProperties(data.properties || []);
            if (data.properties?.length > 0) {
                setSelectedProperty(data.properties[0]._id);
            }
        } catch (error) {
            console.error('Error loading properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        const startingDayOfWeek = firstDay.getDay();

        return { daysInMonth, startingDayOfWeek };
    };

    const previousMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    const [blockedDates, setBlockedDates] = useState<string[]>([]);
    const [bookings, setBookings] = useState<Map<string, any>>(new Map());

    // Fetch calendar data for selected property
    useEffect(() => {
        if (selectedProperty) {
            loadCalendarData(selectedProperty);
        }
    }, [selectedProperty, currentDate]);

    const loadCalendarData = async (propertyId: string) => {
        try {
            const year = currentDate.getFullYear();
            const month = currentDate.getMonth();
            const startDate = new Date(year, month, 1).toISOString();
            const endDate = new Date(year, month + 1, 0).toISOString();

            const data = await import('@/services/hostApi').then(m => m.getPropertyAvailability(propertyId, { startDate, endDate }));

            // Helper to expand ranges
            const expandRange = (start: string | Date, end: string | Date) => {
                const dates: string[] = [];
                const current = new Date(start);
                const last = new Date(end);

                while (current <= last) {
                    dates.push(current.toDateString());
                    current.setDate(current.getDate() + 1);
                }
                return dates;
            };

            const newBlockedDates: string[] = [];
            const newBookings = new Map<string, any>();

            if (data) {
                if (data.blockedDates) {
                    data.blockedDates.forEach((block: any) => {
                        const range = expandRange(block.startDate, block.endDate);
                        newBlockedDates.push(...range);
                    });
                }

                if (data.bookings) {
                    data.bookings.forEach((booking: any) => {
                        const range = expandRange(booking.startDate, booking.endDate);
                        range.forEach(dateStr => {
                            newBookings.set(dateStr, booking);
                        });
                    });
                }
            }

            setBlockedDates(newBlockedDates);
            setBookings(newBookings);
        } catch (error) {
            console.error('Error loading calendar data:', error);
        }
    };

    const handleDateClick = async (date: Date) => {
        if (!selectedProperty) return;

        const dateString = date.toDateString();
        const isBooked = bookings.has(dateString);

        if (isBooked) {
            alert('This date is booked by a guest. Go to Bookings to manage it.');
            return;
        }

        const isBlocked = blockedDates.includes(dateString);
        const newBlockedStatus = !isBlocked;

        setBlockedDates(prev =>
            isBlocked ? prev.filter(d => d !== dateString) : [...prev, dateString]
        );

        try {
            await import('@/services/hostApi').then(m => m.updatePropertyAvailability(selectedProperty, {
                date: date.toISOString(),
                available: !newBlockedStatus
            }));
        } catch (error) {
            console.error('Error updating availability:', error);
            setBlockedDates(prev =>
                isBlocked ? [...prev, dateString] : prev.filter(d => d !== dateString)
            );
            alert('Failed to update availability');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader />
            </div>
        );
    }

    if (properties.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                        <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">No Active Properties</h3>
                        <p className="text-gray-600">You need to have active properties to manage your calendar</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Premium Hero Section with Overlapping Cards */}
            <section className="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white pt-8 lg:pt-16 pb-32 sm:pb-20 md:pb-28 lg:pb-32 overflow-hidden">
                <div className="container mx-auto px-6 sm:px-8 lg:px-16 relative z-10">
                    <div className="flex items-start gap-4 lg:gap-6 mb-4">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 flex-shrink-0">
                            <CalendarIcon className="w-7 h-7 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 lg:mb-3 leading-tight">
                                Calendar & Availability
                            </h1>
                            <p className="text-sm sm:text-base lg:text-lg text-white/90">
                                Manage your property availability and pricing
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Property Selector Card - Overlapping Hero */}
            <div className="container mx-auto px-6 sm:px-8 lg:px-16 -mt-20 sm:-mt-16 md:-mt-20 lg:-mt-24 relative z-20 mb-8 lg:mb-12">
                <div className="bg-white rounded-2xl shadow-xl border border-neutral-100 p-6 sm:p-8 lg:p-10">
                    <label className="block text-base lg:text-lg font-semibold text-neutral-900 mb-4">
                        Select Property
                    </label>
                    <div className="relative">
                        <select
                            value={selectedProperty || ''}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            className="w-full px-5 py-4 text-base lg:text-lg font-medium border-2 border-neutral-200 rounded-xl 
                                     focus:ring-2 focus:ring-primary-500 focus:border-primary-500 
                                     hover:border-neutral-300 transition-all duration-200
                                     bg-white shadow-sm appearance-none cursor-pointer
                                     text-neutral-900"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23525252'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                                backgroundRepeat: 'no-repeat',
                                backgroundPosition: 'right 1rem center',
                                backgroundSize: '1.5em 1.5em',
                                paddingRight: '3rem'
                            }}
                        >
                            {properties.map(property => (
                                <option key={property._id} value={property._id}>
                                    {property.title}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Calendar Section */}
            <div className="container mx-auto px-6 sm:px-8 lg:px-16">
                {/* Calendar */}
                <div className="bg-white rounded-2xl shadow-lg border border-neutral-100 p-6 sm:p-8 lg:p-10 mb-6 lg:mb-8">
                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl lg:text-3xl font-bold text-neutral-900">{monthName}</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={previousMonth}
                                className="p-2.5 lg:p-3 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200"
                            >
                                <ChevronLeft className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-700" />
                            </button>
                            <button
                                onClick={nextMonth}
                                className="p-2.5 lg:p-3 hover:bg-neutral-100 rounded-xl transition-colors border border-neutral-200"
                            >
                                <ChevronRight className="w-5 h-5 lg:w-6 lg:h-6 text-neutral-700" />
                            </button>
                        </div>
                    </div>

                    {/* Calendar Grid */}
                    <div className="grid grid-cols-7 gap-2 sm:gap-3 lg:gap-4">
                        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                            <div key={day} className="text-center font-medium text-gray-400 py-2">
                                {day}
                            </div>
                        ))}

                        {Array.from({ length: startingDayOfWeek }).map((_, i) => (
                            <div key={`empty-${i}`} className="aspect-square" />
                        ))}

                        {Array.from({ length: daysInMonth }).map((_, index) => {
                            const day = index + 1;
                            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                            const isToday = date.toDateString() === new Date().toDateString();
                            const isPast = date < new Date() && !isToday;
                            const dateString = date.toDateString();

                            const isBooked = bookings.has(dateString);
                            const isBlocked = blockedDates.includes(dateString) && !isBooked;

                            const bookingData = bookings.get(dateString);

                            return (
                                <button
                                    key={day}
                                    disabled={isPast}
                                    onClick={() => handleDateClick(date)}
                                    className={`aspect-square p-2 border rounded-lg transition-all relative overflow-hidden group ${isPast
                                        ? 'bg-gray-50 text-gray-400 cursor-not-allowed'
                                        : isBooked
                                            ? 'bg-red-50 border-red-200 text-red-900'
                                            : isBlocked
                                                ? 'bg-gray-100 border-gray-300 text-gray-400'
                                                : isToday
                                                    ? 'border-primary-500 bg-primary-50 text-primary-900 font-semibold'
                                                    : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                                        }`}
                                >
                                    <div className="text-sm z-10 relative">{day}</div>

                                    {isBooked && bookingData && (
                                        <div className="absolute inset-x-0 bottom-0 p-1 bg-red-100/80 backdrop-blur-sm text-[10px] truncate">
                                            {bookingData.memberId?.name?.split(' ')[0] || 'Guest'}
                                        </div>
                                    )}

                                    {isBlocked && <div className="text-[10px] text-gray-500 mt-1">Blocked</div>}
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="mt-8 pt-8 border-t border-neutral-200">
                        <h3 className="text-base lg:text-lg font-semibold text-neutral-900 mb-4">Legend</h3>
                        <div className="flex flex-wrap gap-6 text-sm lg:text-base">
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-green-100 border-2 border-green-300 rounded"></div>
                                <span className="text-neutral-700 font-medium">Available</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-red-100 border-2 border-red-300 rounded"></div>
                                <span className="text-neutral-700 font-medium">Booked</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-5 h-5 bg-gray-100 border-2 border-gray-300 rounded"></div>
                                <span className="text-neutral-700 font-medium">Blocked</span>
                            </div>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="mt-6 lg:mt-8 p-5 lg:p-6 bg-blue-50 border-2 border-blue-200 rounded-xl">
                        <p className="text-sm lg:text-base text-blue-900 leading-relaxed">
                            <strong className="font-semibold">Note:</strong> Click on dates to toggle availability. Bookings must be managed in the Bookings tab.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
