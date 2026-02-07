import React from 'react';

interface BookingProgressBarProps {
    currentStep: number;
    steps: string[];
}

export default function BookingProgressBar({ currentStep, steps }: BookingProgressBarProps) {
    return (
        <div className="w-full">
            <div className="flex items-center justify-between w-full">
                {steps.map((step, index) => {
                    const stepNumber = index + 1;
                    const isActive = stepNumber === currentStep;
                    const isCompleted = stepNumber < currentStep;
                    const isFirst = index === 0;
                    const isLast = index === steps.length - 1;

                    return (
                        <React.Fragment key={index}>
                            {/* Step Item */}
                            <div className="flex flex-col items-center z-10">
                                <div
                                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300"
                                    style={{
                                        background: isCompleted ? 'linear-gradient(135deg, #5CE1E6 0%, #3d9da3 100%)' :
                                            isActive ? 'linear-gradient(135deg, #5CE1E6 0%, #3d9da3 100%)' :
                                                'rgba(71, 85, 105, 0.4)',
                                        color: isCompleted || isActive ? '#0a0e27' : '#94a3b8',
                                        border: 'none',
                                        boxShadow: isActive ? '0 0 15px rgba(92, 225, 230, 0.4)' : '0 2px 5px rgba(0, 0, 0, 0.2)'
                                    }}
                                >
                                    {isCompleted ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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
                                    className="mt-2 text-xs font-bold uppercase tracking-wide"
                                    style={{
                                        color: isActive || isCompleted ? '#5CE1E6' : '#64748b',
                                        fontSize: '0.65rem'
                                    }}
                                >
                                    {step}
                                </span>
                            </div>

                            {/* Connecting Line */}
                            {index < steps.length - 1 && (
                                <div className="flex-1 h-[2px] mx-2 self-start mt-5" style={{ background: 'rgba(71, 85, 105, 0.6)' }}>
                                    <div
                                        className="h-full transition-all duration-500 ease-out"
                                        style={{
                                            width: isCompleted ? '100%' : '0%',
                                            background: 'linear-gradient(90deg, #3d9da3 0%, #5CE1E6 100%)',
                                            boxShadow: isCompleted ? '0 0 8px rgba(92, 225, 230, 0.4)' : 'none'
                                        }}
                                    />
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>
        </div>
    );
}
