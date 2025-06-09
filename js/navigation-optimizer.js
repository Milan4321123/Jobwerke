/**
 * Navigation Performance Optimizer
 * Optimizes button click navigation to prevent slow loading
 */

(function() {
    'use strict';
    
    // Optimized navigation function
    function optimizedNavigate(url) {
        // Pause all videos before navigation to free up resources
        const videos = document.querySelectorAll('video');
        videos.forEach(video => {
            if (!video.paused) {
                video.pause();
            }
            // Clear source to free memory
            const sources = video.querySelectorAll('source');
            sources.forEach(source => {
                if (source.src) {
                    source.dataset.originalSrc = source.src;
                    source.src = '';
                }
            });
        });
        
        // Show loading indicator
        showLoadingIndicator();
        
        // Small delay to allow cleanup, then navigate
        setTimeout(() => {
            window.location.href = url;
        }, 50);
    }
    
    function showLoadingIndicator() {
        // Create loading overlay if it doesn't exist
        let loader = document.getElementById('nav-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'nav-loader';
            loader.innerHTML = `
                <div class="nav-loader-overlay">
                    <div class="nav-loader-spinner"></div>
                    <p>Lädt...</p>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(24, 24, 68, 0.9);
                z-index: 99999;
                display: flex;
                align-items: center;
                justify-content: center;
                color: white;
                font-family: 'Poppins', sans-serif;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .nav-loader-overlay {
                    text-align: center;
                }
                .nav-loader-spinner {
                    border: 3px solid rgba(255,255,255,0.3);
                    border-radius: 50%;
                    border-top: 3px solid white;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 1rem;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(loader);
        }
        loader.style.display = 'flex';
    }
    
    // Optimize all navigation buttons
    function optimizeNavigationButtons() {
        // Find all buttons with navigation onclick handlers
        const navButtons = document.querySelectorAll('button[onclick*="window.location"], .btn-cta[onclick*="window.location"]');
        
        navButtons.forEach(button => {
            const originalOnclick = button.getAttribute('onclick');
            if (originalOnclick) {
                // Extract URL from onclick
                const urlMatch = originalOnclick.match(/window\.location\.href\s*=\s*['"]([^'"]+)['"]/);
                if (urlMatch) {
                    const targetUrl = urlMatch[1];
                    
                    // Remove original onclick and add optimized handler
                    button.removeAttribute('onclick');
                    button.addEventListener('click', (e) => {
                        e.preventDefault();
                        optimizedNavigate(targetUrl);
                    });
                }
            }
        });
        
        // Also optimize anchor links that navigate
        const navLinks = document.querySelectorAll('a[href*="kontakt.html"], a[href*="#"]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href && href.includes('kontakt.html')) {
                    e.preventDefault();
                    optimizedNavigate(href);
                }
            });
        });
    }
    
    // Preload critical pages
    function preloadCriticalPages() {
        const criticalPages = ['kontakt.html', 'uber-uns.html', 'dienstleistungen.html'];
        
        criticalPages.forEach(page => {
            const link = document.createElement('link');
            link.rel = 'prefetch';
            link.href = page;
            document.head.appendChild(link);
        });
    }
    
    // Initialize optimization
    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                optimizeNavigationButtons();
                preloadCriticalPages();
            });
        } else {
            optimizeNavigationButtons();
            preloadCriticalPages();
        }
    }
    
    init();
    
})();
