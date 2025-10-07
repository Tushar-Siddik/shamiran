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
        // Remove old mode class and add the new one
        appBody.classList.remove('light-mode', 'dark-mode');
        appBody.classList.add(`${theme}-mode`);
        
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
        } else if (data.current) {
            currentCity = data.current.name;
            const mainCondition = data.current.weather[0].main;
            setWeatherTheme(mainCondition); // Set weather class

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
    if (!mapContainer) {
        console.error("Map container not found!");
        return;
    }

    console.log("Initializing map for:", cityName, lat, lon); // Debugging log

    // If a map already exists, remove it
    if (map) {
        map.remove();
    }

    // Initialize the map, centered on the city
    map = L.map('weather-map').setView([lat, lon], 10);

    // Add the OpenStreetMap tiles (NO API key needed here)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    // Create a custom icon for the marker
    const weatherIcon = L.divIcon({
        html: '<i class="fas fa-map-marker-alt text-3xl text-blue-500"></i>',
        iconSize: [30, 30],
        className: 'custom-div-icon'
    });

    // Add a marker for the city
    L.marker([lat, lon], { icon: weatherIcon })
        .addTo(map)
        .bindPopup(`<strong>${cityName}</strong>`)
        .openPopup();
        
    // Add weather radar layer (API key IS needed here)
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

    L.control.layers(null, overlayMaps).addTo(map);
}
// --- End: Map Integration ---