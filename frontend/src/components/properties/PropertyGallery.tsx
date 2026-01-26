import { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Grid3x3 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PropertyGalleryProps {
    images: Array<{ url: string; caption?: string }>;
    title: string;
}

export default function PropertyGallery({ images, title }: PropertyGalleryProps) {
    const [showLightbox, setShowLightbox] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [mobileIndex, setMobileIndex] = useState(0);

    // Lock body scroll when lightbox is open
    useEffect(() => {
        if (showLightbox) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [showLightbox]);

    const displayImages = images.slice(0, 5);
    const remainingCount = Math.max(0, images.length - 5);

    const nextImage = () => {
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = () => {
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const nextMobileImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMobileIndex((prev) => (prev + 1) % images.length);
    };

    const prevMobileImage = (e: React.MouseEvent) => {
        e.stopPropagation();
        setMobileIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <>
            {/* Gallery Grid */}
            <div className="relative h-[40vh] mb-8 rounded-3xl overflow-hidden">
                <div className="grid grid-cols-4 gap-2 h-full">
                    {/* Main Large Image */}
                    <div
                        className="col-span-4 md:col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                        onClick={() => {
                            setCurrentImageIndex(mobileIndex);
                            setShowLightbox(true);
                        }}
                    >
                        <img
                            src={images[mobileIndex]?.url}
                            alt={title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>

                        {/* Mobile Navigation Arrows */}
                        <div className="md:hidden">
                            <button
                                onClick={prevMobileImage}
                                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all backdrop-blur-sm"
                            >
                                <ChevronLeft className="w-5 h-5" />
                            </button>
                            <button
                                onClick={nextMobileImage}
                                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white/80 hover:bg-white text-gray-800 rounded-full shadow-lg transition-all backdrop-blur-sm"
                            >
                                <ChevronRight className="w-5 h-5" />
                            </button>
                            
                            {/* Mobile Image Indicator */}
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 text-white text-xs rounded-full backdrop-blur-sm">
                                {mobileIndex + 1} / {images.length}
                            </div>
                        </div>
                    </div>

                    {/* Grid of 4 smaller images */}
                    {displayImages.slice(1, 5).map((image, index) => (
                        <div
                            key={index}
                            className="relative group cursor-pointer overflow-hidden hidden md:block"
                            onClick={() => {
                                setCurrentImageIndex(index + 1);
                                setShowLightbox(true);
                            }}
                        >
                            <img
                                src={image.url}
                                alt={`${title} ${index + 2}`}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
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

                        {/* Current Image */}
                        <motion.div
                            key={currentImageIndex}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ duration: 0.3 }}
                            className="max-w-7xl max-h-[90vh] mx-auto px-4"
                        >
                            <img
                                src={images[currentImageIndex]?.url}
                                alt={`${title} ${currentImageIndex + 1}`}
                                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                            />
                            {images[currentImageIndex]?.caption && (
                                <p className="text-white text-center mt-4 text-sm">
                                    {images[currentImageIndex].caption}
                                </p>
                            )}
                        </motion.div>

                        {/* Thumbnail Strip */}
                        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-4xl px-4 scrollbar-hide">
                            {images.map((image, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentImageIndex(index)}
                                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                        ? 'border-white scale-110'
                                        : 'border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                >
                                    <img
                                        src={image.url}
                                        alt={`Thumbnail ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
