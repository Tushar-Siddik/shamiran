document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const searchForm = document.getElementById('search-form');
    const weatherContent = document.getElementById('weather-content');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const appBody = document.getElementById('app-body');
    const geoBtn = document.getElementById('geo-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoritesList = document.getElementById('favorites-list');
    // --- Dark Mode Toggle Logic ---
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    // --- Auto-suggestions Logic ---
    const cityInput = document.getElementById('city-input');
    const suggestionsList = document.getElementById('suggestions-list');
    let debounceTimer;

    cityInput.addEventListener('input', function() {
        const query = this.value.trim();
        clearTimeout(debounceTimer); // Clear the previous timer

        if (query.length < 2) {
            hideSuggestions();
            return;
        }

        // Set a new timer
        debounceTimer = setTimeout(() => {
            fetchSuggestions(query);
        }, 300); // Wait for 300ms after user stops typing
    });

    // Hide suggestions when clicking outside
    document.addEventListener('click', function(e) {
        if (!cityInput.contains(e.target) && !suggestionsList.contains(e.target)) {
            hideSuggestions();
        }
    });

    function fetchSuggestions(query) {
        // Get favorites to highlight them
        const favorites = getFavorites();

        fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(suggestions => {
                displaySuggestions(suggestions, favorites);
            })
            .catch(error => {
                console.error('Error fetching suggestions:', error);
                hideSuggestions();
            });
    }

    function displaySuggestions(suggestions, favorites) {
        suggestionsList.innerHTML = ''; // Clear previous suggestions

        if (suggestions.length === 0) {
            hideSuggestions();
            return;
        }

        suggestions.forEach(city => {
            const li = document.createElement('li');
            const isFavorite = favorites.includes(city);
            
            li.innerHTML = `
                <button class="w-full text-left px-4 py-2 flex items-center justify-between hover:bg-blue-100/50 transition-colors group">
                    <span class="text-gray-800 group-hover:text-gray-900">${city}</span>
                    ${isFavorite ? '<i class="fas fa-star text-yellow-500"></i>' : ''}
                </button>
            `;
            
            li.querySelector('button').addEventListener('click', () => {
                cityInput.value = city;
                hideSuggestions();
                searchForm.dispatchEvent(new Event('submit'));
            });
            
            suggestionsList.appendChild(li);
        });

        // Position the list right below the input field
        const inputRect = cityInput.getBoundingClientRect();
        suggestionsList.style.top = `${inputRect.bottom + window.scrollY}px`;
        suggestionsList.style.left = `${inputRect.left + window.scrollX}px`;
        suggestionsList.style.width = `${inputRect.width}px`;

        suggestionsList.classList.remove('hidden');
    }

    function hideSuggestions() {
        suggestionsList.classList.add('hidden');
    }
    // --- End: Auto-suggestions Logic ---

    let currentCity = initialCityName || 'Dhaka';

    function setTheme(theme) {
        const appBody = document.getElementById('app-body');
        const moonCard = document.getElementById('moon-card');

        // Remove old mode class and add the new one
        appBody.classList.remove('light-mode', 'dark-mode');
        appBody.classList.add(`${theme}-mode`);

        if (moonCard) {
            moonCard.classList.remove('moon-card-light-mode', 'moon-card-dark-mode');
            moonCard.classList.add(`moon-card-${theme}-mode`);
        }
        
        darkModeToggle.checked = theme === 'dark';
        localStorage.setItem('theme', theme);
    }

    // Function to set the dynamic weather theme
    function setWeatherTheme(mainCondition) {
        const appBody = document.getElementById('app-body');
        // Remove old weather class and add the new one
        appBody.className = appBody.className.replace(/weather-\S+/g, '').trim();
        const conditionClass = `weather-${mainCondition.toLowerCase()}`;
        appBody.classList.add(conditionClass);
    }

    // Function to update the UI
    function updateUI(data) {
        if (data.error) {
            errorMessage.textContent = data.error;
            errorContainer.classList.remove('hidden');
            weatherContent.innerHTML = '';
            setWeatherTheme('clouds'); // Default to cloudy on error
            setWeatherAnimation('clouds'); // Set a default animation
            setCardAnimation('clouds');
        } else if (data.current) {
            currentCity = data.current.name;
            const mainCondition = data.current.weather[0].main;
            setWeatherTheme(mainCondition); // Set weather class
            setWeatherAnimation(mainCondition);
            setCardAnimation(mainCondition);

            // Update the sunrise/sunset times dynamically
            const sunriseEl = document.querySelector('p:has(.fa-sun)');
            const sunsetEl = document.querySelector('p:has(.fa-moon)');
            if (sunriseEl) sunriseEl.innerHTML = `<i class="fas fa-sun mr-2"></i> Sunrise: ${data.current.formatted_sunrise || 'N/A'}`;
            if (sunsetEl) sunsetEl.innerHTML = `<i class="fas fa-moon mr-2"></i> Sunset: ${data.current.formatted_sunset || 'N/A'}`;

            // For simplicity, we'll reload the page to render the new HTML
            // A more advanced approach would use a JS templating engine
            // For simplicity, we will reload the page. This ensures all components
            // (AQI card, alert banner, etc.) are rendered correctly.
            window.location.href = `/weather?city=${encodeURIComponent(currentCity)}`;
        }
    }

    // Function to toggle the theme
    function toggleTheme() {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
    }

    // Initialize theme on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        setTheme(savedTheme);
    } else {
        // Default to light mode or respect OS preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        setTheme(prefersDark ? 'dark' : 'light');
    }

    // Add event listener to the toggle
    darkModeToggle.addEventListener('change', toggleTheme);

    // --- Favorites Management ---
    function getFavorites() {
        const favs = localStorage.getItem('shamiran_favorites');
        return favs ? JSON.parse(favs) : [];
    }

    function saveFavorites(favorites) {
        localStorage.setItem('shamiran_favorites', JSON.stringify(favorites));
    }

    function addFavorite(city) {
        let favorites = getFavorites();
        if (!favorites.includes(city)) {
            favorites.push(city);
            saveFavorites(favorites);
            renderFavorites();
            updateFavoriteButton();
        }
    }

    function removeFavorite(city) {
        let favorites = getFavorites();
        favorites = favorites.filter(f => f !== city);
        saveFavorites(favorites);
        renderFavorites();
        updateFavoriteButton();
    }

    function renderFavorites() {
        const favorites = getFavorites();
        favoritesList.innerHTML = ''; // Clear current list

        if (favorites.length === 0) {
            favoritesList.innerHTML = '<li class="text-white/60">No favorites added yet.</li>';
            return;
        }

        favorites.forEach(city => {
            const li = document.createElement('li');
            li.innerHTML = `
                <button class="w-full text-left px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors flex justify-between items-center group">
                    <span>${city}</span>
                    <i class="fas fa-times text-white/60 hover:text-red-400 group-hover:text-red-400 cursor-pointer" data-city="${city}"></i>
                </button>
            `;
            // Add event listener to the main button for fetching weather
            li.querySelector('button').addEventListener('click', (e) => {
                if (e.target.tagName !== 'I') { // Don't trigger if 'X' is clicked
                    fetchWeatherForCity(city);
                }
            });
            // Add event listener to the 'X' icon for removing
            li.querySelector('.fa-times').addEventListener('click', (e) => {
                e.stopPropagation();
                removeFavorite(city);
            });
            favoritesList.appendChild(li);
        });
    }

    function updateFavoriteButton() {
        const favorites = getFavorites();
        const icon = favoriteBtn.querySelector('i');
        if (favorites.includes(currentCity)) {
            icon.classList.remove('far');
            icon.classList.add('fas', 'text-yellow-400');
            favoriteBtn.title = 'Remove from Favorites';
        } else {
            icon.classList.remove('fas', 'text-yellow-400');
            icon.classList.add('far');
            favoriteBtn.title = 'Add to Favorites';
        }
    }

    favoriteBtn.addEventListener('click', () => {
        const favorites = getFavorites();
        if (favorites.includes(currentCity)) {
            removeFavorite(currentCity);
        } else {
            addFavorite(currentCity);
        }
    });

    // Map toggle functionality
    const mapToggleBtn = document.getElementById('map-toggle-btn');
    const mapCard = document.getElementById('map-card');
    const closeMapBtn = document.getElementById('close-map-btn');
    let mapInitialized = false;
    
    // Store map data globally for later use
    // window.mapData = {
    //     lat: {{ data.current.coord.lat if data.current and data.current.coord else 'null' }},
    //     lon: {{ data.current.coord.lon if data.current and data.current.coord else 'null' }},
    //     cityName: "{{ data.current.name if data.current else '' }}",
    //     apiKey: "{{ config.API_KEY }}"
    // };

    if (!window.mapData) {
        window.mapData = {
            lat: null,
            lon: null,
            cityName: '',
            apiKey: ''
        };
    }
        
    if (mapToggleBtn && mapCard) {
        mapToggleBtn.addEventListener('click', function() {
            toggleMap();
        });
        
        if (closeMapBtn) {
            closeMapBtn.addEventListener('click', function() {
                hideMap();
            });
        }
    }
    
    function toggleMap() {
        if (mapCard.classList.contains('hidden')) {
            showMap();
        } else {
            hideMap();
        }
    }
    
    function showMap() {
        mapCard.classList.remove('hidden');
        mapToggleBtn.innerHTML = '<i class="fas fa-map-marked-alt"></i>';
        mapToggleBtn.title = 'Hide Map';
        
        // Initialize map only when first shown
        if (!mapInitialized && window.mapData.lat && window.mapData.lon) {
            // Use a small delay to ensure the container is visible before initializing
            setTimeout(() => {
                initializeMap(
                    window.mapData.lat, 
                    window.mapData.lon, 
                    window.mapData.cityName,
                    window.mapData.apiKey
                );
                mapInitialized = true;
            }, 100);
        } else if (!window.mapData.lat || !window.mapData.lon) {
            console.error("Map data is not available");
            // Optionally show an error message to the user
            const mapContainer = document.getElementById('weather-map');
            if (mapContainer) {
                mapContainer.innerHTML = '<div class="flex justify-center items-center h-full"><p class="text-white">Map data is not available for this location.</p></div>';
            }
        }
        
        // Smooth scroll to map
        setTimeout(() => {
            mapCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 200);
    }
    
    function hideMap() {
        mapCard.classList.add('hidden');
        mapToggleBtn.innerHTML = '<i class="fas fa-map"></i>';
        mapToggleBtn.title = 'Show Map';
    }


    // --- Weather Fetching ---
    function fetchWeatherForCity(city) {
        cityInput.value = city;
        searchForm.dispatchEvent(new Event('submit'));
    }

    // Function to set the dynamic background
    function setWeatherBackground(mainCondition) {
        // Remove any existing weather class
        appBody.className = appBody.className.replace(/weather-\S+/g, '').trim();
        
        // Add the new weather class
        const conditionClass = `weather-${mainCondition.toLowerCase()}`;
        appBody.classList.add('min-h-screen', 'transition-all', 'duration-1000', conditionClass);
    }

    // Geolocation button logic
    geoBtn.addEventListener('click', function() {
        if (!navigator.geolocation) {
            errorMessage.textContent = "Geolocation is not supported by your browser.";
            errorContainer.classList.remove('hidden');
            return;
        }

        geoBtn.disabled = true;
        geoBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Finding...';
        weatherContent.innerHTML = '<p class="text-white text-center text-xl">Getting your location...</p>';
        errorContainer.classList.add('hidden');

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                fetch(`/weather-by-coords?lat=${latitude}&lon=${longitude}`, {
                    headers: { 'X-Requested-With': 'XMLHttpRequest' }
                })
                .then(response => response.json())
                .then(data => updateUI(data))
                .catch(error => {
                    console.error('Fetch Error:', error);
                    errorMessage.textContent = 'Could not fetch weather for your location.';
                    errorContainer.classList.remove('hidden');
                    weatherContent.innerHTML = '';
                })
                .finally(() => {
                    geoBtn.disabled = false;
                    geoBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i>My Location';
                });
            },
            (error) => {
                geoBtn.disabled = false;
                geoBtn.innerHTML = '<i class="fas fa-location-crosshairs mr-2"></i>My Location';
                errorMessage.textContent = `Error getting location: ${error.message}`;
                errorContainer.classList.remove('hidden');
                weatherContent.innerHTML = '';
            }
        );
    });

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) return;

        weatherContent.innerHTML = '<p class="text-white text-center text-xl">Loading...</p>';
        errorContainer.classList.add('hidden');

        fetch(`/weather?city=${encodeURIComponent(city)}`, {
            headers: { 'X-Requested-With': 'XMLHttpRequest' }
        })
        .then(response => response.json())
        .then(data => updateUI(data))
        .catch(error => {
            console.error('Fetch Error:', error);
            errorMessage.textContent = 'A network error occurred. Please try again.';
            errorContainer.classList.remove('hidden');
            weatherContent.innerHTML = '';
            setWeatherBackground('clouds');
        });
    });

    // Set initial background on page load
    // We can get this from a global variable set by the template
    if (typeof initialWeatherCondition !== 'undefined') {
        setWeatherTheme(initialWeatherCondition); // Set weather class
        setWeatherAnimation(initialWeatherCondition);
        setCardAnimation(initialWeatherCondition);

        const savedTheme = localStorage.getItem('theme') || 'light';
        setTheme(savedTheme); // Set mode class

        renderFavorites();
        updateFavoriteButton();
    }

});


// --- Map Integration ---
const mapContainer = document.getElementById('weather-map');
let map = null; // To hold the map instance

function initializeMap(lat, lon, cityName, apiKey) {
    // Check if the map container exists
    const mapContainer = document.getElementById('weather-map');
    if (!mapContainer) {
        console.error("Map container not found!");
        return;
    }

    // Validate coordinates
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
        console.error("Invalid coordinates for map initialization");
        return;
    }

    console.log("Initializing map for:", cityName, lat, lon);

    // If a map already exists, remove it
    if (window.map) {
        window.map.remove();
    }

    // Initialize the map, centered on the city
    window.map = L.map('weather-map').setView([lat, lon], 10);

    // Add the OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(window.map);

    // Create a custom icon for the marker
    const weatherIcon = L.divIcon({
        html: '<i class="fas fa-map-marker-alt text-3xl text-blue-500"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
    });

    // Add a marker for the city
    L.marker([lat, lon], { icon: weatherIcon })
        .addTo(window.map)
        .bindPopup(`<strong>${cityName}</strong>`)
        .openPopup();
        
    // Add weather radar layer
    const radarUrl = `https://tile.openweathermap.org/map/precipitation_new/{z}/{x}/{y}.png?appid=${apiKey}`;
    const radarLayer = L.tileLayer(radarUrl, {
        maxZoom: 19,
        opacity: 0.6,
        attribution: 'Weather data © <a href="https://openweathermap.org/">OpenWeatherMap</a>'
    });

    // Add a layer control to toggle the radar
    const overlayMaps = {
        "Precipitation Radar": radarLayer
    };

    L.control.layers(null, overlayMaps).addTo(window.map);
}
// --- End: Map Integration ---

// --- Weather Animation Manager ---
const animationContainer = document.createElement('div');
animationContainer.id = 'weather-animation-container';
document.body.appendChild(animationContainer);

let animationInterval;

function setWeatherAnimation(weatherCondition) {
    // Clear any existing animations
    clearWeatherAnimation();

    const condition = weatherCondition.toLowerCase();
    let particleCount = 0;
    let particleClass = '';
    let interval = 50;

    switch (condition) {
        case 'clouds':
        case 'mist':
        case 'fog':
        case 'haze':
            particleClass = 'cloud-particle';
            particleCount = 4; // Create a few clouds
            createClouds(particleCount);
            break;
        case 'rain':
        case 'drizzle':
            particleClass = 'rain-particle';
            particleCount = 100;
            interval = 30;
            createRainOrSnow(particleClass, particleCount, interval);
            break;
        case 'snow':
            particleClass = 'snow-particle';
            particleCount = 50;
            interval = 200;
            createRainOrSnow(particleClass, particleCount, interval);
            break;
        case 'thunderstorm':
            particleClass = 'rain-particle';
            particleCount = 150;
            interval = 20;
            createRainOrSnow(particleClass, particleCount, interval);
            startLightning();
            break;
        default:
            // For 'clear' or any other weather, do nothing
            return;
    }

    // Create particles
    for (let i = 0; i < particleCount; i++) {
        setTimeout(() => {
            createParticle(particleClass);
        }, Math.random() * 2000); // Stagger the creation
    }
}

// --- Refactored Particle Creation ---
function createClouds(count) {
    for (let i = 0; i < count; i++) {
        createParticle('cloud-particle', Math.random() * 5 + 10); // Slower, varied speed
    }
}

function createRainOrSnow(className, count, interval) {
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            // Pass a random duration to prevent the error
            const duration = Math.random() * 1.5 + 0.5; // Between 0.5s and 2s
            createCardParticle(className, duration); 
        }, Math.random() * 2000);
    }
}

function createParticle(className, customDuration = null) {
    const particle = document.createElement('div');
    particle.className = `weather-particle ${className}`;
    
    const startX = Math.random() * window.innerWidth;
    const animationDuration = customDuration || (Math.random() * 1 + 0.5) + 's';
    const animationDelay = Math.random() * 2 + 's';

    particle.style.left = `${startX}px`;
    particle.style.top = `${Math.random() * 50}%`; // Clouds can be at different heights
    particle.style.animationDuration = animationDuration;
    particle.style.animationDelay = animationDelay;
    
    // Scale clouds randomly for variety
    if (className === 'cloud-particle') {
        particle.style.transform = `scale(${Math.random() * 0.5 + 0.8})`;
    }
    
    animationContainer.appendChild(particle);

    const totalDuration = parseFloat(animationDuration) + parseFloat(animationDelay) * 1000;
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, totalDuration);
}

function clearWeatherAnimation() {
    // Clear the interval for lightning
    if (animationInterval) {
        clearInterval(animationInterval);
    }
    // Remove all child nodes (particles)
    while (animationContainer.firstChild) {
        animationContainer.removeChild(animationContainer.firstChild);
    }
}

function startLightning() {
    animationInterval = setInterval(() => {
        if (Math.random() > 0.8) { // 20% chance of lightning
            const flash = document.createElement('div');
            flash.className = 'thunderstorm-flash flash-animation';
            document.body.appendChild(flash);
            setTimeout(() => flash.remove(), 200); // Remove after animation
        }
    }, 3000); // Check for lightning every 3 seconds
}
// --- End: Weather Animation Manager ---

// --- Card Animation Manager ---
const cardAnimationContainer = document.getElementById('card-animation-container');
let cardAnimationInterval;

function setCardAnimation(weatherCondition) {
    // Clear any existing interval and particles
    if (cardAnimationInterval) {
        clearInterval(cardAnimationInterval);
    }
    while (cardAnimationContainer.firstChild) {
        cardAnimationContainer.removeChild(cardAnimationContainer.firstChild);
    }

    const condition = weatherCondition.toLowerCase();
    let particleClass = '';
    let particleCount = 0;
    let interval = 500; // Slower interval for the card

    switch (condition) {
        case 'clouds':
        case 'mist':
        case 'fog':
        case 'haze':
            particleClass = 'card-cloud';
            particleCount = 3;
            interval = 4000;
            break;
        case 'rain':
        case 'drizzle':
            particleClass = 'card-rain';
            particleCount = 20;
            interval = 300;
            break;
        case 'snow':
            particleClass = 'card-snow';
            particleCount = 15;
            interval = 800;
            break;
        case 'thunderstorm':
            particleClass = 'card-rain';
            particleCount = 25;
            interval = 200;
            startCardLightning();
            break;
        default:
            // For 'clear' or any other weather, do nothing
            return;
    }

    // Start the perpetual animation
    cardAnimationInterval = setInterval(() => {
        if (cardAnimationContainer.children.length < particleCount) {
            // FIX: Always provide a random duration
            const animDuration = Math.random() * 2 + 1; // Between 1s and 3s
            createCardParticle(particleClass, animDuration);
        }
    }, interval);
}

let lastCloudDirection = 'right'; // Start with 'right'

function createCardParticle(className, duration = null) {
    const particle = document.createElement('div');
    
    // For clouds, randomly choose a direction
    // if (className === 'card-cloud') {
    //     const isDriftingRight = Math.random() > 0.5;
    //     particle.className = `weather-particle ${className} ${isDriftingRight ? 'float-right' : 'float-left'}`;
    // } else {
    //     particle.className = `weather-particle ${className}`;
    // }
    // For clouds, use the toggle to determine direction
    if (className === 'card-cloud') {
        // --- CHANGE THIS SECTION ---
        if (lastCloudDirection === 'right') {
            particle.className = `weather-particle ${className} float-left`;
            lastCloudDirection = 'left';
        } else {
            particle.className = `weather-particle ${className} float-right`;
            lastCloudDirection = 'right';
        }
    } else {
        particle.className = `weather-particle ${className}`;
    }
    
    const startX = Math.random() * cardAnimationContainer.offsetWidth;
    particle.style.left = `${startX}px`;
    particle.style.top = '20px';
    
    // Calculate duration once and use it
    let animDuration = duration || (Math.random() * 15 + 20); // 20-35s for clouds
    if (className !== 'card-cloud') {
        animDuration = duration || (Math.random() * 2 + 1); // 1-3s for others
    }
    
    particle.style.animationDuration = `${animDuration}s`;
    
    // Scale clouds randomly for variety
    if (className === 'card-cloud') {
        particle.style.transform = `scale(${Math.random() * 0.5 + 0.8})`;
    }
    
    cardAnimationContainer.appendChild(particle);

    // Remove particle after animation ends
    const timeoutDuration = parseFloat(particle.style.animationDuration) * 1000;
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
        }
    }, timeoutDuration);
}

function startCardLightning() {
    // Use the same interval as the rain
    setInterval(() => {
        if (Math.random() > 0.9) { // 10% chance of lightning
            const flash = document.createElement('div');
            flash.className = 'thunderstorm-flash flash-animation';
            cardAnimationContainer.appendChild(flash);
            setTimeout(() => flash.remove(), 200);
        }
    }, 2000);
}