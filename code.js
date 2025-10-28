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
    // const categoryButtons = document.querySelectorAll('.category-item'); // Uncomment if you need button functionality

    // --- Functions ---

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

    // --- Event Listeners ---

    // Category Dropdown change event
    categorySelect.addEventListener('change', (e) => {
        const selectedCategory = e.target.value;
        populateServices(selectedCategory);
    });

    // Service Dropdown change event
    serviceSelect.addEventListener('change', calculateCharge);

    // Quantity Input change event
    quantityInput.addEventListener('input', calculateCharge);

    // Initial setup
    populateCategories();

    // Prevent form submission for this demo
    document.getElementById('order-form').addEventListener('submit', (e) => {
        e.preventDefault();
        alert(`Order submitted for ${quantityInput.value} units at a charge of ${chargeInput.value}.`);
    });
});
