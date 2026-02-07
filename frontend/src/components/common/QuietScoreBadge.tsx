import { Wifi, Volume2, Laptop } from 'lucide-react'
import { motion } from 'framer-motion'

interface QuietScoreProps {
    connectivityLevel: number // 1-5
    silenceLevel: number // 1-5
    workFromMountain?: {
        isReady: boolean
        wifiSpeed?: string
        dedicatedWorkspace?: boolean
        ergonomicFurniture?: boolean
        powerBackup?: boolean
    }
    size?: 'small' | 'medium' | 'large'
    showDetails?: boolean
}

export default function QuietScoreBadge({
    connectivityLevel,
    silenceLevel,
    workFromMountain,
    size = 'medium',
    showDetails = false,
}: QuietScoreProps) {
    // Calculate overall Quiet Score (weighted average)
    // Silence Level is more important (60%), Connectivity (40%)
    const overallScore = Math.round((silenceLevel * 0.6 + connectivityLevel * 0.4) * 2) / 2

    const getScoreColor = (score: number) => {
        if (score >= 4.5) return 'text-green-600 bg-green-50 border-green-200'
        if (score >= 3.5) return 'text-blue-600 bg-blue-50 border-blue-200'
        if (score >= 2.5) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
        return 'text-orange-600 bg-orange-50 border-orange-200'
    }

    const getScoreLabel = (score: number) => {
        if (score >= 4.5) return 'Exceptional Quiet'
        if (score >= 3.5) return 'Very Quiet'
        if (score >= 2.5) return 'Moderately Quiet'
        return 'Some Activity'
    }

    const sizeClasses = {
        small: 'px-3 py-1.5 text-xs',
        medium: 'px-4 py-2 text-sm',
        large: 'px-6 py-3 text-base',
    }

    const iconSizes = {
        small: 'w-3.5 h-3.5',
        medium: 'w-4 h-4',
        large: 'w-5 h-5',
    }

    return (
        <div className="space-y-2">
            {/* Main Badge */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                className={`inline-flex items-center gap-2 rounded-xl font-bold border-2 ${sizeClasses[size]} ${getScoreColor(overallScore)} shadow-sm hover:shadow-md transition-all`}
            >
                <div className="flex items-center gap-1">
                    <span className="text-2xl font-black">{overallScore.toFixed(1)}</span>
                    <span className="text-xs">/5</span>
                </div>
                <div className="h-5 w-px bg-current opacity-30" />
                <span className="font-semibold">
                    {size === 'large' ? getScoreLabel(overallScore) : 'Quiet Score'}
                </span>
            </motion.div>

            {/* Detailed Breakdown */}
            {showDetails && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-2 p-3 bg-dark-card rounded-xl border border-dark-border shadow-sm"
                >
                    {/* Silence Level */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Volume2 className={`${iconSizes[size]} text-neutral-600`} />
                            <span className="text-sm font-medium text-neutral-700">
                                Silence Level
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-4 rounded-sm ${i < silenceLevel ? 'bg-pine' : 'bg-neutral-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Connectivity Level */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Wifi className={`${iconSizes[size]} text-neutral-600`} />
                            <span className="text-sm font-medium text-neutral-700">
                                Connectivity
                            </span>
                        </div>
                        <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`w-2 h-4 rounded-sm ${i < connectivityLevel ? 'bg-slate' : 'bg-neutral-200'
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Work From Mountain */}
                    {workFromMountain && (
                        <div className="pt-2 border-t border-neutral-100">
                            <div className="flex items-center gap-2 mb-2">
                                <Laptop className={`${iconSizes[size]} text-neutral-600`} />
                                <span className="text-sm font-medium text-neutral-700">
                                    Work From Mountain
                                </span>
                                {workFromMountain.isReady ? (
                                    <span className="ml-auto text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                                        Ready
                                    </span>
                                ) : (
                                    <span className="ml-auto text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                                        Not Available
                                    </span>
                                )}
                            </div>
                            {workFromMountain.isReady && (
                                <div className="space-y-1 text-xs text-neutral-600 ml-6">
                                    {workFromMountain.wifiSpeed && (
                                        <p>📶 WiFi: {workFromMountain.wifiSpeed}</p>
                                    )}
                                    {workFromMountain.dedicatedWorkspace && (
                                        <p>🪑 Dedicated workspace available</p>
                                    )}
                                    {workFromMountain.powerBackup && (
                                        <p>⚡ Power backup available</p>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>
            )}
        </div>
    )
}
