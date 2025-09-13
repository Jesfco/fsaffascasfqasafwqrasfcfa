(function() {
    'use strict';
    function lazyLoadImages() {
        const images = document.querySelectorAll('img[data-src]');
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }

    function preloadCriticalResources() {
        const criticalResources = [
            { href: 'data/content/plugins.json', as: 'fetch' },
            { href: 'data/content/news.json', as: 'fetch' }
        ];
        
        criticalResources.forEach(resource => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = resource.href;
            link.as = resource.as;
            if (resource.as === 'fetch') {
                link.crossOrigin = 'anonymous';
            }
            document.head.appendChild(link);
        });
    }

    function optimizeAnimations() {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            document.documentElement.style.setProperty('--transition-normal', '0s');
            document.documentElement.style.setProperty('--transition-fast', '0s');
            document.documentElement.style.setProperty('--transition-slow', '0s');
        }
    }
    
    // Performance metrics (silent tracking)
    function trackPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    performance.getEntriesByType('navigation')[0];
                }, 0);
            });
        }
    }
    
    document.addEventListener('DOMContentLoaded', () => {
        lazyLoadImages();
        optimizeAnimations();
        trackPerformance();
        
        if ('connection' in navigator && navigator.connection.effectiveType === '4g') {
            preloadCriticalResources();
        }
    });
    
})();