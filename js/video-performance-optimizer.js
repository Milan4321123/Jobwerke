/**
 * Performance optimization for video loading
 * This script implements lazy loading for videos to improve page load speed
 */

(function() {
    'use strict';
    
    let videoObserver;
    
    function createVideoObserver() {
        if (!('IntersectionObserver' in window)) {
            // Fallback for older browsers
            loadAllVideos();
            return;
        }
        
        videoObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    loadVideo(entry.target);
                    videoObserver.unobserve(entry.target);
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });
    }
    
    function loadVideo(video) {
        const source = video.querySelector('source');
        if (source && source.dataset.src) {
            source.src = source.dataset.src;
            video.load();
            
            // Ensure controls are still hidden after loading
            setTimeout(() => {
                video.controls = false;
                video.removeAttribute('controls');
                video.setAttribute('controls', 'false');
            }, 100);
        }
    }
    
    function loadAllVideos() {
        const videos = document.querySelectorAll('video[data-lazy="true"]');
        videos.forEach(loadVideo);
    }
    
    function setupLazyLoading() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Skip navbar video - load immediately
            if (video.classList.contains('navbar-logo-video')) {
                return;
            }
            
            const source = video.querySelector('source');
            if (source && source.src) {
                // Move src to data-src for lazy loading
                source.dataset.src = source.src;
                source.src = '';
                video.setAttribute('data-lazy', 'true');
                
                // Observe video for lazy loading
                if (videoObserver) {
                    videoObserver.observe(video);
                }
            }
        });
    }
    
    function optimizeVideoPreloading() {
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Only preload navbar video immediately
            if (video.classList.contains('navbar-logo-video')) {
                video.preload = 'metadata';
            } else {
                video.preload = 'none';
            }
            
            // Ensure all videos have proper attributes
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.setAttribute('controls', 'false');
            video.setAttribute('disablepictureinpicture', '');
            video.controls = false;
            
            // Add performance optimization for slow connections
            video.addEventListener('loadstart', function() {
                if (video.readyState === 0) {
                    // If video isn't loading properly, add a timeout
                    setTimeout(() => {
                        if (video.readyState === 0) {
                            console.log('Video loading timeout, skipping:', video.src);
                            video.style.display = 'none';
                        }
                    }, 3000);
                }
            });
        });
    }
    
    function init() {
        createVideoObserver();
        optimizeVideoPreloading();
        
        // Only setup lazy loading for non-critical videos
        if (window.innerWidth > 768) {
            setupLazyLoading();
        } else {
            // On mobile, load videos only when they're actually visible
            setTimeout(setupLazyLoading, 1000);
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
})();
