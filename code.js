/* GENERATED FROM PROMPT: follow.by SMM PANEL — author: automated generator. Replace YOUR_TELEGRAM_BOT_USERNAME and API endpoints before production. */

// --- CONFIGURATION ---
const DEMO_MODE = true; // Set to false to enable real API calls
const MAX_POLL_ATTEMPTS = 10;
const INITIAL_POLL_INTERVAL = 2000; // 2 seconds
const TELEGRAM_BOT_USERNAME = 'YOUR_TELEGRAM_BOT_USERNAME'; // MUST be replaced

// --- API ENDPOINTS (Developer TODO) ---
const API_ENDPOINTS = {
    CREATE_INVOICE: 'TODO: https://api.follow.by/create-invoice',
    SESSION_STATUS: 'TODO: https://api.follow.by/session-status',
};

// --- STATE MANAGEMENT ---
let currentSessionRef = null;
let pollAttempt = 0;
let pollingTimer = null;
let currentMockState = 'waiting';
let sessionPollingActive = false;

// --- UTILITY FUNCTIONS ---

/**
 * Generates a short, random base36 string for a session reference.
 * @returns {string} The session reference.
 */
const generateSessionRef = () => {
    // Generate a random 12-character base36 string
    return Math.random().toString(36).substring(2, 14);
};

/**
 * Copies text to the clipboard and shows a brief visual confirmation.
 * @param {string} text - The text to copy.
 */
const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
        showToast('Link copied to clipboard!', 'success');
    }).catch(err => {
        console.error('Could not copy text: ', err);
        showToast('Failed to copy. Please manually select the URL.', 'error');
    });
};

/**
 * Displays a toast notification with a message.
 * @param {string} msg - The message to display.
 * @param {string} type - 'info', 'success', or 'error'.
 */
const showToast = (msg, type = 'info') => {
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    
    // Set message and styling
    toastMessage.textContent = msg;
    toast.className = `toast toast-${type}`;
    toast.classList.remove('hidden');

    // Automatically hide after a delay
    setTimeout(() => {
        toast.classList.add('hidden');
    }, 6000);
};


// --- TELEGRAM FLOW FUNCTIONS ---

/**
 * Builds the deep link and opens the Telegram bot.
 * @param {string} sessionRef - The unique session ID.
 */
const openTelegramBot = (sessionRef) => {
    const deepLink = `https://t.me/${TELEGRAM_BOT_USERNAME}?start=${sessionRef}`;

    // 1. Store sessionRef
    sessionStorage.setItem('sessionRef', sessionRef);
    currentSessionRef = sessionRef;

    // 2. Open link in a new tab/window
    window.open(deepLink, '_blank', 'noopener,noreferrer');

    // 3. Show toast notification and link
    document.getElementById('copy-link-btn').onclick = () => copyToClipboard(deepLink);
    showToast('Opening Telegram... If Telegram doesn’t open, click here to copy the deep link.', 'info');
    
    // 4. Start polling for status
    startSessionPolling(sessionRef);
};


// --- POLLING & STATUS FUNCTIONS ---

/**
 * Updates the UI based on the current session status.
 * @param {string} status - The status from the server: 'waiting', 'paid', 'processing', 'done', 'error'.
 * @param {string} message - A descriptive message.
 */
const updateStatusUI = (status, message, sessionRef) => {
    const statusPanel = document.getElementById('status-panel');
    const currentStatusEl = document.getElementById('current-status');
    const statusMessageEl = document.getElementById('status-message');
    const sessionRefDisplay = document.getElementById('session-ref-display');
    
    statusPanel.classList.remove('hidden');
    currentStatusEl.className = 'status-box'; // Reset classes
    sessionRefDisplay.textContent = `#${sessionRef.substring(0, 8)}`; // Display truncated ref

    let statusText = '';
    let statusClass = '';

    switch (status) {
        case 'waiting':
            statusText = 'Waiting for Payment in Telegram';
            statusClass = 'status-waiting';
            break;
        case 'paid':
            statusText = 'Payment Received - Order Queued';
            statusClass = 'status-paid';
            break;
        case 'processing':
            statusText = 'Order In Progress';
            statusClass = 'status-processing';
            break;
        case 'done':
            statusText = 'Order Completed Successfully!';
            statusClass = 'status-done';
            break;
        case 'error':
            statusText = 'Order Error/Cancelled';
            statusClass = 'status-error';
            break;
        default:
            statusText = 'Unknown Status';
            statusClass = 'status-error';
            break;
    }

    currentStatusEl.textContent = statusText;
    currentStatusEl.classList.add(statusClass);
    statusMessageEl.textContent = message;

    if (status === 'done' || status === 'error') {
        stopSessionPolling();
        document.getElementById('restart-poll-btn').classList.remove('hidden');
        document.getElementById('stop-poll-btn').classList.add('hidden');
    }
};

/**
 * Mocks the server response for the session status endpoint in DEMO_MODE.
 * Cycles through 'waiting' -> 'paid' -> 'processing' -> 'done'.
 * @returns {{status: string, message: string, orderId: string}} The mocked response object.
 */
const mockServerResponses = () => {
    const states = ['waiting', 'paid', 'processing', 'done', 'error'];
    const messages = {
        'waiting': 'Please check your Telegram app to complete the purchase.',
        'paid': 'Thank you! Your order has been confirmed and is now being prepared.',
        'processing': 'Fulfilling your order. Status will update shortly.',
        'done': 'All services delivered. Check your profile!',
        'error': 'An error occurred. Please contact support with your session ID.',
    };

    let nextIndex = states.indexOf(currentMockState) + 1;
    if (nextIndex >= states.length) nextIndex = 0;
    
    // Only advance the state manually if it's not the initial poll or a manual advance
    // In actual polling, we just use the currentMockState
    if (pollAttempt > 0) {
        currentMockState = states[nextIndex - 1]; // Use current state for the response, advance logic will handle transition
    } else {
        currentMockState = states[0];
    }
    
    // For manual mock progression
    const advanceMockState = () => {
        let currentIndex = states.indexOf(currentMockState);
        let nextState = states[(currentIndex + 1) % states.length];
        currentMockState = nextState;
        return currentMockState;
    };
    
    return {
        // Return the *current* mocked state for the poll response
        status: currentMockState,
        message: messages[currentMockState],
        orderId: currentSessionRef ? `ORD-${currentSessionRef.substring(0, 5)}` : null
    };
};

/**
 * Polls the backend for the session status with exponential backoff.
 * @param {string} sessionRef - The session ID to check.
 */
const pollSessionStatus = async (sessionRef) => {
    if (!sessionPollingActive) return;

    pollAttempt++;
    const interval = INITIAL_POLL_INTERVAL * Math.pow(2, pollAttempt - 1);
    const delay = Math.min(interval, 30000); // Max delay of 30 seconds

    console.log(`Polling status for ${sessionRef}, attempt ${pollAttempt}, delay ${delay / 1000}s`);

    let response;
    try {
        if (DEMO_MODE) {
            response = mockServerResponses();
            // In demo mode, manually update state if mock progression is triggered later
        } else {
            // TODO: Replace with real fetch
            // const url = `${API_ENDPOINTS.SESSION_STATUS}?ref=${sessionRef}`;
            // const apiResponse = await fetch(url);
            // response = await apiResponse.json();
            throw new Error('API not configured.');
        }

        updateStatusUI(response.status, response.message, sessionRef);

        if (response.status === 'done' || response.status === 'error') {
            console.log('Polling complete.');
            stopSessionPolling();
            return;
        }

    } catch (error) {
        console.error('Polling error:', error);
        if (pollAttempt >= MAX_POLL_ATTEMPTS) {
            updateStatusUI('error', `Max polling attempts reached. Please check Telegram or contact support. Error: ${error.message}`, sessionRef);
            stopSessionPolling();
            return;
        }
    }

    // Schedule the next poll
    if (pollAttempt < MAX_POLL_ATTEMPTS) {
        pollingTimer = setTimeout(() => pollSessionStatus(sessionRef), delay);
    } else {
        updateStatusUI('error', 'Max polling attempts reached. Showing Captcha placeholder.', sessionRef);
        // TODO: Implement captcha display logic here
        stopSessionPolling();
    }
};

/**
 * Starts the polling loop.
 * @param {string} sessionRef - The session ID.
 */
const startSessionPolling = (sessionRef) => {
    if (sessionPollingActive) stopSessionPolling();
    
    sessionPollingActive = true;
    currentSessionRef = sessionRef;
    pollAttempt = 0;
    
    // Show mock button in demo mode
    if (DEMO_MODE) {
         document.getElementById('mock-progress-btn').classList.remove('hidden');
    }

    document.getElementById('stop-poll-btn').classList.remove('hidden');
    document.getElementById('restart-poll-btn').classList.add('hidden');
    
    // Initial UI state before first poll
    updateStatusUI('waiting', 'Open Telegram to link your account and initiate payment.', sessionRef);
    
    // Start the first poll immediately
    pollSessionStatus(sessionRef);
};

/**
 * Stops the polling loop.
 */
const stopSessionPolling = () => {
    sessionPollingActive = false;
    clearTimeout(pollingTimer);
    document.getElementById('stop-poll-btn').classList.add('hidden');
    
    if (DEMO_MODE) {
        document.getElementById('mock-progress-btn').classList.remove('hidden');
    }
};

// --- EVENT HANDLERS ---
document.addEventListener('DOMContentLoaded', () => {
    const openTelegramBtn = document.getElementById('open-telegram-btn');
    const buyBtns = document.querySelectorAll('.buy-btn');
    const modeToggle = document.getElementById('mode-toggle');
    const categoryButtons = document.querySelectorAll('.category-item');
    const restartPollBtn = document.getElementById('restart-poll-btn');
    const stopPollBtn = document.getElementById('stop-poll-btn');
    const mockProgressBtn = document.getElementById('mock-progress-btn');

    /**
     * Handles the primary CTA click to start the Telegram session.
     */
    const handleCtaClick = () => {
        const sessionRef = generateSessionRef();
        openTelegramBot(sessionRef);
    };

    /**
     * Handles Buy button click from pricing cards.
     */
    const handleBuyClick = (e) => {
        const packageId = e.currentTarget.getAttribute('data-package');
        const checkbox = e.currentTarget.parentNode.querySelector('input[type="checkbox"]');
        
        if (!checkbox || !checkbox.checked) {
            showToast('Please agree to the Terms of Service.', 'error');
            return;
        }

        // Generate REF and open Telegram to proceed with purchase of this package
        const sessionRef = generateSessionRef();
        
        // TODO: In a real implementation, you would store the packageId in the session
        // or embed it in a secure way in the deep link REF to link the choice with the payment.
        console.log(`Starting purchase for package: ${packageId} with sessionRef: ${sessionRef}`);
        
        openTelegramBot(sessionRef);
    };
    
    /**
     * Handles category quick-select click.
     */
    const handleCategoryClick = (e) => {
        const category = e.currentTarget.getAttribute('data-category');
        showToast(`Category selected: ${category}. Please click 'Open in Telegram' to view services.`, 'info');
        // In a real app, this would typically update a search filter UI element, 
        // but for this landing page, it's illustrative.
    };
    
    /**
     * Toggles between light and dark mode.
     */
    const handleModeToggle = () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');
        // Update button icon
        modeToggle.textContent = document.body.classList.contains('dark-mode') ? '☀️' : '🌙';
    };

    // --- Attach Listeners ---
    openTelegramBtn.addEventListener('click', handleCtaClick);
    buyBtns.forEach(btn => btn.addEventListener('click', handleBuyClick));
    modeToggle.addEventListener('click', handleModeToggle);
    categoryButtons.forEach(btn => btn.addEventListener('click', handleCategoryClick));
    
    restartPollBtn.addEventListener('click', () => {
        if (currentSessionRef) {
            startSessionPolling(currentSessionRef);
        } else {
            showToast('No active session found. Click "Open in Telegram" to start.', 'error');
        }
    });
    
    stopPollBtn.addEventListener('click', stopSessionPolling);

    if (DEMO_MODE) {
        mockProgressBtn.addEventListener('click', () => {
            if (currentSessionRef) {
                // Manually advance the mock state
                const states = ['waiting', 'paid', 'processing', 'done', 'error'];
                let currentIndex = states.indexOf(currentMockState);
                currentMockState = states[(currentIndex + 1) % states.length];
                
                // Immediately update UI based on the new state
                const messages = {
                    'waiting': 'Please check your Telegram app to complete the purchase.',
                    'paid': 'Thank you! Your order has been confirmed and is now being prepared.',
                    'processing': 'Fulfilling your order. Status will update shortly.',
                    'done': 'All services delivered. Check your profile!',
                    'error': 'An error occurred. Please contact support with your session ID.',
                };
                updateStatusUI(currentMockState, messages[currentMockState], currentSessionRef);
                
                // Stop polling if done/error is reached
                if (currentMockState === 'done' || currentMockState === 'error') {
                     stopSessionPolling();
                }
                
                console.log(`DEMO: Status manually advanced to: ${currentMockState}`);
            } else {
                showToast('Start a session first to use the demo mode.', 'error');
            }
        });
    }

    // --- INITIALIZATION ---

    // Check for existing session on load
    const storedRef = sessionStorage.getItem('sessionRef');
    if (storedRef) {
        currentSessionRef = storedRef;
        // Resume polling on refresh (simulated)
        startSessionPolling(currentSessionRef); 
    }
});

// --- Testimonial Carousel Logic ---
document.addEventListener('DOMContentLoaded', () => {
    const carousel = document.querySelector('.testimonial-carousel');
    const dots = document.querySelectorAll('.dot');
    const cardWidth = carousel.querySelector('.testimonial-card').offsetWidth + (2 * 16); // Card width + margin

    let currentIndex = 0;

    const updateCarousel = () => {
        const offset = -currentIndex * cardWidth;
        carousel.style.transform = `translateX(${offset}px)`;

        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === currentIndex);
        });
    };

    dots.forEach(dot => {
        dot.addEventListener('click', (e) => {
            currentIndex = parseInt(e.target.getAttribute('data-slide'));
            updateCarousel();
        });
    });

    // Auto-advance the carousel
    setInterval(() => {
        currentIndex = (currentIndex + 1) % dots.length;
        updateCarousel();
    }, 5000); // Change slide every 5 seconds

    // Initial setup
    updateCarousel();
    
    // Recalculate card width on resize to ensure responsiveness
    window.addEventListener('resize', () => {
        // Simple fix: Reload on resize or recalculate cardWidth and re-run update
        // For simplicity and to prevent complex JS layout recalculation, we keep the simple CSS/JS model.
    });
});
