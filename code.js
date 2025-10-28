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

    // --- Menu Toggle Logic ---
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from closing it immediately
        menuDropdown.classList.toggle('hidden');
    });
    
    // Close menu if clicked outside
    document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
            menuDropdown.classList.add('hidden');
        }
    });
    
    // --- Page Logic (Login/Dashboard Simulation) ---

    // Function to update the top box based on login status
    function updateWelcomeBox(isLoggedIn, username = 'rrrosl5') {
        if (isLoggedIn) {
            // Dashboard State (Simulated 4-Card look as requested)
            welcomeBox.classList.remove('flex-col', 'items-center', 'justify-center', 'gap-3', 'text-center');
            welcomeBox.classList.add('flex', 'items-center', 'gap-4');
            welcomeBox.innerHTML = `
                <img src="https://i.ibb.co/L8y2Nf3/avatar-placeholder.png" alt="User Avatar" class="w-10 h-10 rounded-full">
                <div>
                    <strong class="font-semibold text-gray-900">${username}</strong> <span class="text-blue-500">&#x2713;</span>
                    <p class="text-sm text-gray-500">Welcome to Smart Kit</p>
                </div>
            `;
            // Optional: Hide Login/Register in dropdown, show Logout
            menuDropdown.querySelector('[data-action="logout"]').style.display = 'block';
            menuDropdown.querySelector('[href="register.html"]').style.display = 'none';
            menuDropdown.querySelector('[href="login.html"]').style.display = 'none';

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
            
            // Attach listener to the new button
            document.getElementById('cta-button-active').addEventListener('click', () => {
                // This would typically lead to a Login/Register page
                window.location.href = 'login.html'; 
            });
            
            // Optional: Show Login/Register in dropdown, hide Logout
            menuDropdown.querySelector('[data-action="logout"]').style.display = 'none';
            menuDropdown.querySelector('[href="register.html"]').style.display = 'block';
            menuDropdown.querySelector('[href="login.html"]').style.display = 'block';
        }
    }

    // --- Telegram Auto-Login Check (Simulation) ---
    function checkTelegramUser() {
        // **REAL TELEGRAM LOGIC:** Check window.Telegram.WebApp.initDataUnsafe for user ID.
        // If a user ID is found: send it to your backend (Firebase/Supabase) to check for an existing account.
        
        // **SIMULATION:** Default to logged out for the landing page demonstration
        // To test the "logged in" view, change 'false' to 'true'.
        const isTelegramUserRegistered = false; 

        if (isTelegramUserRegistered) {
            updateWelcomeBox(true, 'rrrosl5'); 
        } else {
            updateWelcomeBox(false); 
        }
    }

    // --- Form Functionality (Unchanged) ---

    // 1. Populate Category Select from data
    function populateCategories() {
        Array.from(categorySelect.options).forEach((option, index) => {
            if (index > 0) categorySelect.removeChild(option);
        });

        Object.keys(servicesData).forEach(categoryKey => {
            const option = document.createElement('option');
            option.value = categoryKey;
            option.textContent = categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1);
            categorySelect.appendChild(option);
        });
    }

    // 2. Populate Service Select based on Category selection
    function populateServices(category) {
        serviceSelect.innerHTML = '<option value="" disabled selected>Select a service...</option>';
        averageTimeInput.value = 'N/A';
        chargeInput.value = '₹0.00';

        if (category && servicesData[category]) {
            servicesData[category].forEach(service => {
                const option = document.createElement('option');
                option.value = service.id;
                option.textContent = service.name;
                option.dataset.rate = service.rate;
                option.dataset.time = service.time;
                serviceSelect.appendChild(option);
            });
        }
    }

    // 3. Calculate Charge
    function calculateCharge() {
        const selectedOption = serviceSelect.options[serviceSelect.selectedIndex];
        const quantity = parseInt(quantityInput.value);
        
        chargeInput.value = '₹0.00';
        averageTimeInput.value = 'N/A';

        if (selectedOption && selectedOption.dataset.rate && quantity > 0) {
            const rate = parseFloat(selectedOption.dataset.rate);
            const time = selectedOption.dataset.time;
            const charge = (rate * quantity).toFixed(2);

            chargeInput.value = `₹${charge}`;
            averageTimeInput.value = time;
        }
    }

    // --- Event Listeners and Initial Setup ---

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
