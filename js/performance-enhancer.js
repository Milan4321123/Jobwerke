/**
 * Final Performance Enhancement Suite
 * This script provides additional optimizations for the website performance
 */

(function() {
    'use strict';
    
    // Performance monitoring and optimization
    const PerformanceEnhancer = {
        
        // Initialize all performance optimizations
        init: function() {
            this.optimizeResourceLoading();
            this.enhanceButtonResponsiveness();
            this.optimizeVideoPerformance();
            this.setupProgressiveLoading();
            this.handleSlowConnections();
        },
        
        // Optimize resource loading priority
        optimizeResourceLoading: function() {
            // Preload critical CSS
            const criticalCSS = ['css/kontakt.css', 'css/index.css'];
            criticalCSS.forEach(css => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'style';
                link.href = css;
                document.head.appendChild(link);
            });
            
            // Defer non-critical scripts
            const scripts = document.querySelectorAll('script[src]:not([data-critical])');
            scripts.forEach(script => {
                if (!script.hasAttribute('defer') && !script.hasAttribute('async')) {
                    script.defer = true;
                }
            });
        },
        
        // Enhance button responsiveness
        enhanceButtonResponsiveness: function() {
            const buttons = document.querySelectorAll('.btn-cta, button[onclick]');
            
            buttons.forEach(button => {
                // Add immediate visual feedback
                button.addEventListener('mousedown', function() {
                    this.style.transform = 'scale(0.98)';
                });
                
                button.addEventListener('mouseup', function() {
                    this.style.transform = '';
                });
                
                // Add loading state for navigation buttons
                if (button.getAttribute('onclick') && button.getAttribute('onclick').includes('kontakt.html')) {
                    button.addEventListener('click', function() {
                        this.classList.add('loading');
                        this.style.pointerEvents = 'none';
                        
                        // Ensure loading state is removed after navigation
                        setTimeout(() => {
                            this.classList.remove('loading');
                            this.style.pointerEvents = '';
                        }, 2000);
                    });
                }
            });
        },
        
        // Advanced video performance optimization
        optimizeVideoPerformance: function() {
            const videos = document.querySelectorAll('video');
            
            videos.forEach(video => {
                // Implement intelligent loading based on viewport
                if ('IntersectionObserver' in window) {
                    const observer = new IntersectionObserver((entries) => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting && video.readyState === 0) {
                                video.load();
                                observer.unobserve(video);
                            }
                        });
                    }, { threshold: 0.1 });
                    
                    // Don't observe navbar videos - they should load immediately
                    if (!video.classList.contains('navbar-logo-video')) {
                        observer.observe(video);
                    }
                }
                
                // Handle video loading errors gracefully
                video.addEventListener('error', function() {
                    console.warn('Video failed to load:', this.src);
                    this.style.display = 'none';
                    
                    // Show fallback image if available
                    const fallbackImg = this.getAttribute('data-fallback');
                    if (fallbackImg) {
                        const img = document.createElement('img');
                        img.src = fallbackImg;
                        img.className = this.className;
                        this.parentNode.replaceChild(img, this);
                    }
                });
                
                // Optimize video quality for slower connections
                if (navigator.connection && navigator.connection.effectiveType) {
                    const connectionType = navigator.connection.effectiveType;
                    if (connectionType === 'slow-2g' || connectionType === '2g') {
                        video.style.display = 'none';
                    }
                }
            });
        },
        
        // Setup progressive loading for images and videos
        setupProgressiveLoading: function() {
            // Add loading placeholders
            const videos = document.querySelectorAll('video:not(.navbar-logo-video)');
            videos.forEach(video => {
                if (!video.hasAttribute('data-loaded')) {
                    // Create loading placeholder
                    const placeholder = document.createElement('div');
                    placeholder.className = 'video-placeholder';
                    placeholder.style.cssText = `
                        width: 100%;
                        height: 100%;
                        background: linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
                                   linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
                                   linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
                                   linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
                        background-size: 20px 20px;
                        background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        position: absolute;
                        top: 0;
                        left: 0;
                        z-index: 1;
                    `;
                    placeholder.innerHTML = '<span style="color: #666; font-size: 14px;">Loading...</span>';
                    
                    // Insert placeholder
                    video.parentNode.style.position = 'relative';
                    video.parentNode.insertBefore(placeholder, video);
                    
                    // Remove placeholder when video loads
                    video.addEventListener('loadeddata', function() {
                        if (placeholder && placeholder.parentNode) {
                            placeholder.remove();
                        }
                        this.setAttribute('data-loaded', 'true');
                    });
                }
            });
        },
        
        // Handle slow connections and show appropriate feedback
        handleSlowConnections: function() {
            // Detect slow connections
            if (navigator.connection) {
                const connection = navigator.connection;
                const isSlowConnection = connection.effectiveType === 'slow-2g' || 
                                       connection.effectiveType === '2g' ||
                                       connection.downlink < 1;
                
                if (isSlowConnection) {
                    // Show slow connection notice
                    this.showSlowConnectionNotice();
                    
                    // Reduce video quality/quantity
                    const videos = document.querySelectorAll('video:not(.navbar-logo-video)');
                    videos.forEach(video => {
                        video.preload = 'none';
                        video.style.filter = 'blur(1px)'; // Reduce quality
                    });
                }
            }
            
            // Monitor page load performance
            window.addEventListener('load', () => {
                const loadTime = performance.now();
                if (loadTime > 3000) { // If page takes more than 3 seconds
                    console.warn('Slow page load detected:', loadTime + 'ms');
                    this.optimizeForSlowLoading();
                }
            });
        },
        
        showSlowConnectionNotice: function() {
            const notice = document.createElement('div');
            notice.style.cssText = `
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: rgba(255, 193, 7, 0.9);
                color: #333;
                text-align: center;
                padding: 10px;
                z-index: 9998;
                font-size: 14px;
                font-family: 'Poppins', sans-serif;
            `;
            notice.innerHTML = 'Slow connection detected. Some videos may be disabled for better performance.';
            document.body.appendChild(notice);
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                if (notice.parentNode) {
                    notice.remove();
                }
            }, 5000);
        },
        
        optimizeForSlowLoading: function() {
            // Disable autoplay for all videos except critical ones
            const videos = document.querySelectorAll('video:not(.navbar-logo-video)');
            videos.forEach(video => {
                video.autoplay = false;
                video.preload = 'none';
            });
            
            // Simplify animations
            const style = document.createElement('style');
            style.textContent = `
                *, *::before, *::after {
                    animation-duration: 0.1s !important;
                    animation-delay: 0s !important;
                    transition-duration: 0.1s !important;
                }
            `;
            document.head.appendChild(style);
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            PerformanceEnhancer.init();
        });
    } else {
        PerformanceEnhancer.init();
    }
    
    // Export for potential external use
    window.PerformanceEnhancer = PerformanceEnhancer;
    
})();
