/**
 * Lazy load images utility
 * Provides IntersectionObserver-based image lazy loading with WebP support
 */

export interface LazyLoadOptions {
    rootMargin?: string;
    threshold?: number;
    useWebP?: boolean;
}

const DEFAULT_OPTIONS: LazyLoadOptions = {
    rootMargin: '50px',
    threshold: 0.01,
    useWebP: true,
};

/**
 * Check if browser supports WebP format
 */
export const supportsWebP = (): boolean => {
    if (typeof window === 'undefined') return false;

    const canvas = document.createElement('canvas');
    if (canvas.getContext && canvas.getContext('2d')) {
        return canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
};

/**
 * Convert image URL to WebP if supported and available
 */
export const getOptimizedImageUrl = (url: string, useWebP: boolean = true): string => {
    if (!useWebP || !supportsWebP()) return url;

    // If it's already WebP, return as is
    if (url.endsWith('.webp')) return url;

    // Try to replace extension with .webp (assuming server has WebP versions)
    const webpUrl = url.replace(/\.(jpg|jpeg|png)$/i, '.webp');
    return webpUrl;
};

/**
 * Initialize lazy loading for images
 */
export const initLazyLoad = (options: LazyLoadOptions = {}): (() => void) => {
    const mergedOptions = { ...DEFAULT_OPTIONS, ...options };

    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
        // Fallback: load all images immediately
        loadAllImages();
        return () => { };
    }

    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target as HTMLImageElement;
                loadImage(img, mergedOptions.useWebP);
                observer.unobserve(img);
            }
        });
    }, {
        rootMargin: mergedOptions.rootMargin,
        threshold: mergedOptions.threshold,
    });

    // Observe all images with data-src attribute
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => imageObserver.observe(img));

    // Return cleanup function
    return () => {
        imageObserver.disconnect();
    };
};

/**
 * Load a single image
 */
const loadImage = (img: HTMLImageElement, useWebP?: boolean): void => {
    const src = img.getAttribute('data-src');
    const srcset = img.getAttribute('data-srcset');

    if (!src) return;

    // Set srcset if available
    if (srcset) {
        img.srcset = srcset;
    }

    // Set src with WebP optimization if enabled
    const optimizedSrc = useWebP ? getOptimizedImageUrl(src, true) : src;

    img.src = optimizedSrc;
    img.removeAttribute('data-src');
    img.removeAttribute('data-srcset');

    // Add loaded class for CSS transitions
    img.classList.add('lazy-loaded');

    // Handle load error - fallback to original format
    img.onerror = () => {
        if (useWebP && optimizedSrc !== src) {
            img.src = src;
        }
    };
};

/**
 * Fallback: Load all images immediately (for browsers without IntersectionObserver)
 */
const loadAllImages = (): void => {
    const images = document.querySelectorAll('img[data-src]');
    images.forEach(img => loadImage(img as HTMLImageElement, false));
};

/**
 * React Hook for lazy loading
 */
export const useLazyLoad = (options?: LazyLoadOptions) => {
    if (typeof window === 'undefined') return;

    const cleanup = initLazyLoad(options);

    // Cleanup on unmount
    return cleanup;
};

/**
 * Get image props for lazy loading in React
 */
export const getLazyImageProps = (src: string, alt: string, useWebP: boolean = true) => {
    return {
        'data-src': src,
        src: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1"%3E%3C/svg%3E', // 1x1 transparent SVG placeholder
        alt,
        loading: 'lazy' as const,
        className: 'lazy-image',
        onLoad: (e: React.SyntheticEvent<HTMLImageElement>) => {
            if (useWebP && supportsWebP()) {
                const img = e.currentTarget;
                const dataSrc = img.getAttribute('data-src');
                if (dataSrc) {
                    img.src = getOptimizedImageUrl(dataSrc, true);
                    img.removeAttribute('data-src');
                }
            }
        },
    };
};
