interface BookingProgressBarProps {
    currentStep: number;
    steps: string[];
}

export default function BookingProgressBar({ currentStep, steps }: BookingProgressBarProps) {
    return (
        <div className="mb-8">
            {/* Progress Bar */}
            <div className="relative">
                <div className="flex items-center justify-between mb-2">
                    {steps.map((step, index) => {
                        const stepNumber = index + 1;
                        const isActive = stepNumber === currentStep;
                        const isCompleted = stepNumber < currentStep;

                        return (
                            <div key={index} className="flex-1 flex items-center">
                                {/* Step Circle */}
                                <div className="relative flex flex-col items-center">
                                    <div
                                        className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${isCompleted
                                            ? 'bg-green-600 text-white'
                                            : isActive
                                                ? 'bg-primary-600 text-white ring-4 ring-primary-100'
                                                : 'bg-gray-200 text-gray-500'
                                            }`}
                                    >
                                        {isCompleted ? (
                                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                                <path
                                                    fillRule="evenodd"
                                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                    clipRule="evenodd"
                                                />
                                            </svg>
                                        ) : (
                                            stepNumber
                                        )}
                                    </div>
                                    <span
                                        className={`mt-2 text-xs font-medium whitespace-nowrap ${isActive ? 'text-primary-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                                            }`}
                                    >
                                        {step}
                                    </span>
                                </div>

                                {/* Connecting Line */}
                                {index < steps.length - 1 && (
                                    <div className="flex-1 h-1 mx-2 -mt-8">
                                        <div
                                            className={`h-full rounded transition-all duration-300 ${stepNumber < currentStep ? 'bg-green-600' : 'bg-gray-200'
                                                }`}
                                        />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
