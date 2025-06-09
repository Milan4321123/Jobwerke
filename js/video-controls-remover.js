/**
 * Universal Video Controls Remover for Mobile Devices
 * This script forcefully removes all video controls and ensures videos behave consistently across all devices
 */

(function() {
    'use strict';
    
    function forceRemoveVideoControls() {
        // Get all video elements on the page
        const videos = document.querySelectorAll('video');
        
        videos.forEach(video => {
            // Remove any controls attribute that might exist
            video.removeAttribute('controls');
            video.removeAttribute('control');
            
            // Force set attributes that prevent controls
            video.setAttribute('controls', 'false');
            video.setAttribute('controlsList', 'nodownload nofullscreen noremoteplayback');
            video.setAttribute('disablepictureinpicture', '');
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            
            // Ensure the video properties are set correctly
            video.controls = false;
            video.disablePictureInPicture = true;
            video.playsInline = true;
            
            // Force remove any event listeners that might show controls
            video.style.pointerEvents = 'none';
            
            // Add CSS class for additional styling control
            video.classList.add('no-controls-video');
            
            // Prevent context menu (right-click) on videos
            video.addEventListener('contextmenu', function(e) {
                e.preventDefault();
                return false;
            });
            
            // Prevent any touch/click events that might trigger controls
            video.addEventListener('touchstart', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, { passive: false });
            
            video.addEventListener('touchend', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }, { passive: false });
            
            video.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            
            video.addEventListener('dblclick', function(e) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            });
            
            // Override any attempts to show controls via JavaScript
            Object.defineProperty(video, 'controls', {
                get: function() { return false; },
                set: function() { /* do nothing */ },
                configurable: false
            });
        });
        
        console.log(`Video controls remover: Processed ${videos.length} videos`);
    }
    
    // Function to apply additional CSS rules via JavaScript
    function injectVideoControlCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* JavaScript-injected video control hiding */
            .no-controls-video {
                -webkit-appearance: none !important;
                -moz-appearance: none !important;
                appearance: none !important;
                pointer-events: none !important;
            }
            
            .no-controls-video::-webkit-media-controls,
            .no-controls-video::-webkit-media-controls-panel,
            .no-controls-video::-webkit-media-controls-play-button,
            .no-controls-video::-webkit-media-controls-start-playback-button,
            .no-controls-video::-webkit-media-controls-volume-panel,
            .no-controls-video::-webkit-media-controls-mute-button,
            .no-controls-video::-webkit-media-controls-timeline,
            .no-controls-video::-webkit-media-controls-current-time-display,
            .no-controls-video::-webkit-media-controls-time-remaining-display,
            .no-controls-video::-webkit-media-controls-fullscreen-button,
            .no-controls-video::-webkit-media-controls-rewind-button,
            .no-controls-video::-webkit-media-controls-return-to-realtime-button,
            .no-controls-video::-webkit-media-controls-toggle-closed-captions-button,
            .no-controls-video::-webkit-media-controls-enclosure {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
                pointer-events: none !important;
                width: 0 !important;
                height: 0 !important;
            }
            
            .no-controls-video::-moz-video-controls {
                display: none !important;
                opacity: 0 !important;
                visibility: hidden !important;
            }
            
            /* Mobile-specific overrides */
            @media screen and (max-width: 1024px) {
                .no-controls-video {
                    -webkit-touch-callout: none !important;
                    -webkit-user-select: none !important;
                    -khtml-user-select: none !important;
                    -moz-user-select: none !important;
                    -ms-user-select: none !important;
                    user-select: none !important;
                    outline: none !important;
                    pointer-events: none !important;
                }
                
                .no-controls-video::-webkit-media-controls-enclosure,
                .no-controls-video::-webkit-media-controls {
                    display: none !important;
                    visibility: hidden !important;
                    opacity: 0 !important;
                    width: 0 !important;
                    height: 0 !important;
                }
                
                .no-controls-video:focus {
                    outline: none !important;
                    border: none !important;
                }
                
                .no-controls-video:hover {
                    cursor: default !important;
                }
            }
            
            /* Universal overrides for all devices */
            video.no-controls-video {
                outline: none !important;
                border: none !important;
                cursor: default !important;
                -webkit-appearance: none !important;
            }
            
            video.no-controls-video:focus,
            video.no-controls-video:active {
                outline: none !important;
                border: none !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Function to monitor for dynamically added videos
    function observeNewVideos() {
        const observer = new MutationObserver(function(mutations) {
            mutations.forEach(function(mutation) {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        if (node.tagName === 'VIDEO') {
                            setTimeout(() => forceRemoveVideoControls(), 10);
                        } else if (node.querySelectorAll) {
                            const videos = node.querySelectorAll('video');
                            if (videos.length > 0) {
                                setTimeout(() => forceRemoveVideoControls(), 10);
                            }
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // Initialize when DOM is ready
    function init() {
        injectVideoControlCSS();
        forceRemoveVideoControls();
        observeNewVideos();
        
        // Re-run after a short delay to catch any videos that load asynchronously
        setTimeout(forceRemoveVideoControls, 100);
        setTimeout(forceRemoveVideoControls, 500);
        setTimeout(forceRemoveVideoControls, 1000);
    }
    
    // Run initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Also run on window load as a fallback
    window.addEventListener('load', forceRemoveVideoControls);
    
})();
