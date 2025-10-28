document.addEventListener('DOMContentLoaded', () => {
    
    // --- Sample Data for demonstration ---
    const servicesData = {
        facebook: [
            { id: 1, name: 'FB Likes - High Quality', time: '12h', rate: 0.05 },
            { id: 2, name: 'FB Followers - Instant', time: '1h', rate: 0.15 }
        ],
        instagram: [
            { id: 3, name: 'IG Followers - Fast', time: '5h', rate: 0.10 },
            { id: 4, name: 'IG Likes - Standard', time: '8h', rate: 0.02 }
        ],
        tiktok: [
            { id: 5, name: 'TikTok Views - Organic', time: '3h', rate: 0.01 },
        ]
    };

    // --- DOM Elements ---
    const categorySelect = document.getElementById('category-select');
    const serviceSelect = document.getElementById('service-select');
    const quantityInput = document.getElementById('quantity-input');
    const chargeInput = document.getElementById('charge-input');
    const averageTimeInput = document.getElementById('average-time');
    
    // New Menu and CTA Elements
    const menuToggle = document.getElementById('menu-toggle');
    const menuDropdown = document.getElementById('menu-dropdown');
    const welcomeBox = document.getElementById('welcome-box');

    // Modal Elements
    const modalOverlay = document.getElementById('auth-modal-overlay');
    const loginContainer = document.getElementById('login-form-container');
    const registerContainer = document.getElementById('register-form-container');
    const closeModalButton = document.getElementById('close-modal');
    const switchToRegisterLink = document.getElementById('switch-to-register');
    const switchToLoginLink = document.getElementById('switch-to-login');


    // --- Menu & Modal Functions ---

    // Function to open the modal and display a specific form
    function openAuthModal(mode) {
        menuDropdown.classList.add('hidden'); // Close header menu
        modalOverlay.classList.remove('hidden'); // Show modal backdrop
        
        // Switch form visibility
        if (mode === 'login') {
            loginContainer.classList.remove('hidden');
            registerContainer.classList.add('hidden');
        } else if (mode === 'register') {
            registerContainer.classList.remove('hidden');
            loginContainer.classList.add('hidden');
        }
    }

    // Function to close the modal
    function closeAuthModal() {
        modalOverlay.classList.add('hidden');
    }

    // --- Menu Toggle Logic ---
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        menuDropdown.classList.toggle('hidden');
    });
    
    // Close menu if clicked outside
    document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
            menuDropdown.classList.add('hidden');
        }
    });

    // --- Modal Event Listeners ---
    closeModalButton.addEventListener('click', closeAuthModal);
    modalOverlay.addEventListener('click', (e) => {
        // Close modal when clicking the backdrop, but not the form box itself
        if (e.target === modalOverlay) {
            closeAuthModal();
        }
    });

    // Link handlers for switching between forms inside the modal
    switchToRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('register');
    });
    switchToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });
    
    // Header Menu Link Handlers
    document.querySelector('[data-action="open-login"]').addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('login');
    });
    document.querySelector('[data-action="open-register"]').addEventListener('click', (e) => {
        e.preventDefault();
        openAuthModal('register');
    });


    // --- Page Logic (Login/Dashboard Simulation) ---

    function updateWelcomeBox(isLoggedIn, username = 'rrrosl5') {
        if (isLoggedIn) {
            // Dashboard State (Single Card)
            welcomeBox.classList.remove('flex-col', 'items-center', 'justify-center', 'gap-3', 'text-center');
            welcomeBox.classList.add('flex', 'items-center', 'gap-4');
            welcomeBox.innerHTML = `
                <img src="https://i.ibb.co/L8y2Nf3/avatar-placeholder.png" alt="User Avatar" class="w-10 h-10 rounded-full">
                <div>
                    <strong class="font-semibold text-gray-900">${username}</strong> <span class="text-blue-500">&#x2713;</span>
                    <p class="text-sm text-gray-500">Welcome to Smart Kit</p>
                </div>
            `;
            // Hide Login/Register in dropdown, show Logout
            document.querySelector('[data-action="logout"]').classList.remove('hidden');
            document.querySelector('[data-action="open-register"]').classList.add('hidden');
            document.querySelector('[data-action="open-login"]').classList.add('hidden');

        } else {
            // Landing Page State (Single CTA Box)
            welcomeBox.classList.add('flex-col', 'items-center', 'justify-center', 'gap-3', 'text-center');
            welcomeBox.classList.remove('flex', 'items-center', 'gap-4');
            welcomeBox.innerHTML = `
                <p class="text-lg font-semibold text-gray-900">Get Started Now</p>
                <p class="text-sm text-gray-500">Log in or Register to manage your social media services and orders.</p>
                <button id="cta-button-active" class="w-2/3 py-2 text-white font-bold rounded-lg bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 transition-colors">
                    Login or Register
                </button>
            `;
            
            // Attach listener to the new button (since it's dynamically created)
            document.getElementById('cta-button-active').addEventListener('click', () => {
                openAuthModal('login'); 
            });
            
            // Show Login/Register in dropdown, hide Logout
            document.querySelector('[data-action="logout"]').classList.add('hidden');
            document.querySelector('[data-action="open-register"]').classList.remove('hidden');
            document.querySelector('[data-action="open-login"]').classList.remove('hidden');
        }
    }

    // --- Telegram Auto-Login Check (Simulation) ---
    function checkTelegramUser() {
        // SIMULATION: Set to true to test the logged-in view automatically.
        const isTelegramUserRegistered = false; 

        if (isTelegramUserRegistered) {
            updateWelcomeBox(true, 'rrrosl5'); 
        } else {
            updateWelcomeBox(false); 
        }
    }

    // --- Form Functionality (Unchanged) ---
    function populateCategories() { /* ... */ }
    function populateServices(category) { /* ... */ }
    function calculateCharge() { /* ... */ }

    categorySelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        populateServices(selectedCategory);
    });
    serviceSelect.addEventListener('change', calculateCharge);
    quantityInput.addEventListener('input', calculateCharge);
    
    // Prevent form submission for this demo
    document.getElementById('order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert(`Order submitted (Demo)`);
    });
    
    // Logout Handler
    document.querySelector('[data-action="logout"]').addEventListener('click', (e) => {
        e.preventDefault();
        updateWelcomeBox(false);
        menuDropdown.classList.add('hidden');
        alert("Logged out successfully (Demo).");
    });
    
    // Run on load
    populateCategories();
    checkTelegramUser(); // Start the auto-login check
});
