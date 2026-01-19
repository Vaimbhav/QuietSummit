import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3x3, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface JourneyGalleryProps {
    images: string[];
    title: string;
}

export default function JourneyGallery({ images, title }: JourneyGalleryProps) {
    const [showLightbox, setShowLightbox] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const displayImages = images.slice(0, 5);
    const remainingCount = Math.max(0, images.length - 5);

    const isVideo = (url: string) => {
        return /\.(mp4|webm|ogg|mov)$/i.test(url) || url.includes('player.cloudinary.com/embed');
    };

    const getVideoThumbnail = (url: string) => {
        // Extract public_id from Cloudinary URL for thumbnail
        if (url.includes('player.cloudinary.com/embed')) {
            const match = url.match(/public_id=([^&]+)/);
            const cloudNameMatch = url.match(/cloud_name=([^&]+)/);
            if (match && cloudNameMatch) {
                const publicId = match[1];
                const cloudName = cloudNameMatch[1];
                return `https://res.cloudinary.com/${cloudName}/video/upload/${publicId}.jpg`;
            }
        }
        return url;
    };

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="relative h-[320px] md:h-[400px] lg:h-[480px] mb-8 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-4 gap-2 h-full">
                    {/* Main Large Image/Video */}
                    <div
                        className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                        onClick={() => {
                            setCurrentImageIndex(0);
                            setShowLightbox(true);
                        }}
                    >
                        {isVideo(displayImages[0]) ? (
                            <>
                                <img
                                    src={getVideoThumbnail(displayImages[0])}
                                    alt={title}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                                    <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center">
                                        <Play className="w-8 h-8 text-gray-900 ml-1" fill="currentColor" />
                                    </div>
                                </div>
                            </>
                        ) : (
                            <img
                                src={displayImages[0]}
                                alt={title}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                        )}
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                    </div>

                    {/* Grid of 4 smaller images/videos */}
                    {displayImages.slice(1, 5).map((image, index) => (
                        <div
                            key={index}
                            className="relative group cursor-pointer overflow-hidden hidden md:block"
                            onClick={() => {
                                setCurrentImageIndex(index + 1);
                                setShowLightbox(true);
                            }}
                        >
                            {isVideo(image) ? (
                                <>
                                    <img
                                        src={getVideoThumbnail(image)}
                                        alt={`${title} ${index + 2}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-10 h-10 bg-white/90 rounded-full flex items-center justify-center">
                                            <Play className="w-5 h-5 text-gray-900 ml-0.5" fill="currentColor" />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <img
                                    src={image}
                                    alt={`${title} ${index + 2}`}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            )}
                            <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                            {/* Show remaining count on last image */}
                            {index === 3 && remainingCount > 0 && (
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                    <div className="text-white text-center">
                                        <Grid3x3 className="w-8 h-8 mx-auto mb-2" />
                                        <p className="text-lg font-bold">+{remainingCount} more</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Show All Photos Button */}
                <button
                    onClick={() => setShowLightbox(true)}
                    className="absolute bottom-6 right-6 px-6 py-3 bg-white hover:bg-gray-50 text-gray-900 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 border border-gray-200"
                >
                    <Grid3x3 className="w-5 h-5" />
                    Show all photos
                </button>
            </div>

            {/* Lightbox Modal */}
            <AnimatePresence>
                {showLightbox && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
                    >
                        {/* Close Button */}
                        <button
                            onClick={() => setShowLightbox(false)}
                            className="absolute top-6 right-6 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute top-6 left-6 px-4 py-2 bg-white/10 text-white rounded-full backdrop-blur-sm font-medium z-10">
                            {currentImageIndex + 1} / {images.length}
                        </div>

                        {/* Navigation Buttons */}
                        {images.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                                >
                                    <ChevronLeft className="w-6 h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-6 p-4 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors backdrop-blur-sm z-10"
                                >
                                    <ChevronRight className="w-6 h-6" />
                                </button>
                            </>
                        )}

                        {/* Current Image/Video */}
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-7xl max-h-[90vh] mx-auto px-4"
                        >
                            {isVideo(images[currentImageIndex]) ? (
                                images[currentImageIndex].includes('player.cloudinary.com/embed') ? (
                                    <iframe
                                        src={images[currentImageIndex]}
                                        title={`${title} video ${currentImageIndex + 1}`}
                                        allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                                        allowFullScreen
                                        className="w-full aspect-video max-h-[90vh] rounded-lg"
                                    />
                                ) : (
                                    <video
                                        src={images[currentImageIndex]}
                                        controls
                                        autoPlay
                                        loop
                                        className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                    />
                                )
                            ) : (
                                <img
                                    src={images[currentImageIndex]}
                                    alt={`${title} ${currentImageIndex + 1}`}
                                    className="max-w-full max-h-[90vh] object-contain rounded-lg"
                                />
                            )}
                        </motion.div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-4xl px-4 scrollbar-hide">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all relative ${index === currentImageIndex
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    {isVideo(image) ? (
                                        <>
                                            <img
                                                src={getVideoThumbnail(image)}
                                                alt={`Thumbnail ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Play className="w-4 h-4 text-white drop-shadow-lg" fill="white" />
                                            </div>
                                        </>
                                    ) : (
                                        <img
                                            src={image}
                                            alt={`Thumbnail ${index + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
