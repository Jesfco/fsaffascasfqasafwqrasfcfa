class DownloadManager {
    constructor() {
        this.adDuration = 5000; // 5 seconds
        this.downloadUrl = '';
        this.init();
    }

    init() {
        // Get download URL from query parameters
        const urlParams = new URLSearchParams(window.location.search);
        this.downloadUrl = urlParams.get('url') || '';

        if (!this.downloadUrl) {
            this.showError('No download URL provided');
            return;
        }

        this.loadAd(); // Load the ad
        this.startAdTimer();
        this.setupSkipButton();
    }

    startAdTimer() {
        const progressBar = document.querySelector('.progress-fill');
        const downloadText = document.querySelector('.download-text');
        const skipBtn = document.getElementById('skip-btn');

        let progress = 0;
        const interval = 100; // Update every 100ms
        const increment = (interval / this.adDuration) * 100;

        const timer = setInterval(() => {
            progress += increment;
            progressBar.style.width = `${Math.min(progress, 100)}%`;

            if (progress >= 100) {
                clearInterval(timer);
                this.startDownload();
            }
        }, interval);

        // Show skip button after 3 seconds
        setTimeout(() => {
            skipBtn.style.display = 'inline-block';
        }, 3000);
    }

    setupSkipButton() {
        const skipBtn = document.getElementById('skip-btn');
        skipBtn.addEventListener('click', () => {
            this.startDownload();
        });
    }

    startDownload() {
        const downloadText = document.querySelector('.download-text');
        downloadText.textContent = 'Starting download...';

        // Create invisible download link
        const link = document.createElement('a');
        link.href = this.downloadUrl;
        link.download = '';
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Redirect back or show success message
        setTimeout(() => {
            downloadText.textContent = 'Download started! You can close this page.';
            setTimeout(() => {
                window.close() || (window.location.href = '/');
            }, 2000);
        }, 1000);
    }

    showError(message) {
        const downloadText = document.querySelector('.download-text');
        downloadText.textContent = message;
        downloadText.style.color = '#dc3545';
    }

    // Method to load privacy-friendly ads
    loadAd() {
        const adSpace = document.querySelector('.ad-space');

        // Option 1: EthicalAds (most privacy-friendly)
        this.loadEthicalAds(adSpace);

        // Option 2: Fallback to Carbon Ads if EthicalAds fails
        // this.loadCarbonAds(adSpace);

        // Option 3: Google AdSense with non-personalized ads
        // this.loadGoogleAds(adSpace);
    }

    loadEthicalAds(adSpace) {
        const adDiv = document.createElement('div');
        adDiv.setAttribute('data-ea-publisher', 'your-publisher-id'); // Replace with your EthicalAds publisher ID
        adDiv.setAttribute('data-ea-type', 'image');
        adDiv.setAttribute('data-ea-style', 'stickybox');
        adDiv.id = 'ethical-ad';

        adSpace.innerHTML = '';
        adSpace.appendChild(adDiv);

        const script = document.createElement('script');
        script.src = 'https://media.ethicalads.io/media/client/ethicalads.min.js';
        script.async = true;
        script.onload = () => {
            console.log('EthicalAds loaded successfully');
        };
        script.onerror = () => {
            console.log('EthicalAds failed, showing placeholder');
            adSpace.innerHTML = '<div class="ad-placeholder"><p>Advertisement Space</p></div>';
        };
        document.head.appendChild(script);
    }

    loadCarbonAds(adSpace) {
        const carbonScript = document.createElement('script');
        carbonScript.async = true;
        carbonScript.type = 'text/javascript';
        carbonScript.src = '//cdn.carbonads.com/carbon.js?serve=YOUR-CARBON-ID&placement=yoursite'; // Replace with your Carbon placement
        carbonScript.id = '_carbonads_js';

        adSpace.innerHTML = '';
        adSpace.appendChild(carbonScript);
    }

    loadGoogleAds(adSpace) {
        const adScript = document.createElement('script');
        adScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
        adScript.async = true;
        adScript.crossOrigin = 'anonymous';
        document.head.appendChild(adScript);

        const adElement = document.createElement('ins');
        adElement.className = 'adsbygoogle';
        adElement.style.display = 'block';
        adElement.style.width = '100%';
        adElement.style.height = '280px';
        adElement.setAttribute('data-ad-client', 'ca-pub-XXXXXXXXXX');
        adElement.setAttribute('data-ad-slot', 'XXXXXXXXXX');
        adElement.setAttribute('data-ad-format', 'rectangle');
        adElement.setAttribute('data-npa', '1'); // Non-personalized ads

        adSpace.innerHTML = '';
        adSpace.appendChild(adElement);

        try {
            (adsbygoogle = window.adsbygoogle || []).push({});
        } catch (e) {
            console.error('AdSense error:', e);
            adSpace.innerHTML = '<div class="ad-placeholder"><p>Advertisement</p></div>';
        }
    }
}

// Initialize download manager when page loads
document.addEventListener('DOMContentLoaded', () => {
    new DownloadManager();
});