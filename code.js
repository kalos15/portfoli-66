// --- Initialize Firebase & Database References ---
const auth = firebase.auth();
const db = firebase.firestore();
// -------------------------------------------------

document.addEventListener('DOMContentLoaded', () => {
    
    // --- Telegram & Firebase Elements ---
    const menuToggle = document.getElementById('menu-toggle');
    const menuDropdown = document.getElementById('menu-dropdown');
    const welcomeBox = document.getElementById('welcome-box');
    const logoutLink = document.getElementById('logout-link');

    // --- Utility Function to Fetch Profile Photo URL ---
    // Telegram Mini App User object only gives photo_url for the LOGIN WIDGET.
    // For a Mini App, you usually need to make a request to the Telegram Bot API 
    // from your backend/Cloud Function to get the full profile picture. 
    // For now, we'll use a placeholder and the user's name/username.
    function getProfilePhotoUrl(user) {
        // NOTE: Replace this with a call to your Cloud Function to get the real photo
        return user.photo_url || 'https://i.ibb.co/L8y2Nf3/avatar-placeholder.png';
    }


    // --- 🔑 Main Authentication & Display Function ---
    async function checkTelegramAuth() {
        const webApp = window.Telegram.WebApp;
        
        // 1. Check if Telegram WebApp is initialized
        if (!webApp || !webApp.initData) {
            welcomeBox.innerHTML = `<p class="text-red-500 font-semibold">Error: Not running in Telegram WebApp.</p>`;
            return;
        }

        // 2. Get User Data and Init Data
        const user = webApp.initDataUnsafe.user;
        const initData = webApp.initData;

        if (!user) {
            welcomeBox.innerHTML = `<p class="text-red-500 font-semibold">Error: Could not retrieve Telegram user data.</p>`;
            return;
        }

        // 3. Update UI to "Connecting..."
        welcomeBox.innerHTML = `<p class="text-lg font-semibold text-gray-900">Authenticating...</p>`;
        
        try {
            // 4. Call Cloud Function for Verification and Custom Token Minting
            // *** YOU MUST CREATE AND DEPLOY THIS FUNCTION ON YOUR FIREBASE BACKEND ***
            // The URL below is a placeholder for your deployed function URL.
            const AUTH_FUNCTION_URL = 'YOUR_FIREBASE_FUNCTION_URL/verifyTelegramAuth'; 

            const response = await fetch(AUTH_FUNCTION_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // Sending the full initData string for backend verification
                body: JSON.stringify({ initData: initData })
            });

            const data = await response.json();

            if (data.customToken) {
                // 5. Sign in to Firebase using the Custom Token
                await auth.signInWithCustomToken(data.customToken);
                
                // 6. Final UI Update (Logged In)
                updateWelcomeBox(true, user, data.balance); 
                webApp.ready(); // Signal that the app is ready

            } else {
                // Handle case where customToken is not returned (e.g., hash verification failed)
                welcomeBox.innerHTML = `<p class="text-red-500 font-semibold">Authentication failed. Please restart the bot.</p>`;
            }

        } catch (error) {
            console.error("Firebase/Telegram Auth Error:", error);
            welcomeBox.innerHTML = `<p class="text-red-500 font-semibold">Connection Error. (${error.message})</p>`;
        }
    }

    // --- UI Display Logic ---
    function updateWelcomeBox(isLoggedIn, user = null, balance = '0.00') {
        if (isLoggedIn && user) {
            const displayName = user.username ? `@${user.username}` : user.first_name;
            const photoUrl = getProfilePhotoUrl(user);
            
            // Dashboard State (Profile Card)
            welcomeBox.classList.remove('flex-col', 'items-center', 'justify-center', 'gap-3', 'text-center');
            welcomeBox.classList.add('flex', 'items-center', 'gap-4');
            
            welcomeBox.innerHTML = `
                <img src="${photoUrl}" alt="User Avatar" class="w-12 h-12 rounded-full object-cover">
                <div>
                    <div class="flex items-center gap-2">
                        <strong class="font-bold text-gray-900">${displayName}</strong> 
                        <span class="text-blue-500 text-lg">&#x2713;</span>
                    </div>
                    <p class="text-sm text-gray-500">Balance: $<span class="font-semibold text-green-600">${balance}</span></p>
                </div>
            `;
            
            logoutLink.classList.remove('hidden');

        } else {
            // Error/Fallback State
            welcomeBox.classList.add('flex-col', 'items-center', 'justify-center', 'gap-3', 'text-center');
            welcomeBox.classList.remove('flex', 'items-center', 'gap-4');
            welcomeBox.innerHTML = `
                <p class="text-lg font-semibold text-gray-900">User Not Authorized</p>
                <p class="text-sm text-gray-500">Please start the app via Telegram to proceed.</p>
            `;
            logoutLink.classList.add('hidden');
        }
    }

    // --- Event Listeners and Initial Setup (Simplified) ---

    // Menu Toggle Logic
    menuToggle.addEventListener('click', (e) => {
        e.stopPropagation(); 
        menuDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', (e) => {
        if (!menuDropdown.contains(e.target) && e.target !== menuToggle) {
            menuDropdown.classList.add('hidden');
        }
    });

    // Logout Handler (Only signs out of Firebase Auth client-side)
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        auth.signOut().then(() => {
            updateWelcomeBox(false);
            menuDropdown.classList.add('hidden');
            window.Telegram.WebApp.showAlert("Logged out. Please restart the bot to log in again.");
        }).catch((error) => {
            window.Telegram.WebApp.showAlert(`Logout Error: ${error.message}`);
        });
    });

    // --- Start Authentication Flow ---
    checkTelegramAuth(); 

    // --- Other Form Functionality (Unchanged from previous versions) ---
    // ... populateCategories(), populateServices(), calculateCharge() ... 
});
