document.addEventListener('DOMContentLoaded', function() {
    // --- DOM Elements ---
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const weatherContent = document.getElementById('weather-content');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const appBody = document.getElementById('app-body');
    const geoBtn = document.getElementById('geo-btn');
    const favoriteBtn = document.getElementById('favorite-btn');
    const favoritesList = document.getElementById('favorites-list');

    let currentCity = initialCityName || 'Dhaka';

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

    // Function to update the UI
    function updateUI(data) {
        if (data.error) {
            errorMessage.textContent = data.error;
            errorContainer.classList.remove('hidden');
            weatherContent.innerHTML = '';
            setWeatherBackground('clouds'); // Default to cloudy on error
        } else if (data.current) {
            // Set background based on the main weather condition
            const mainCondition = data.current.weather[0].main;
            setWeatherBackground(mainCondition);

            // Update the sunrise/sunset times dynamically
            const sunriseEl = document.querySelector('p:has(.fa-sun)');
            const sunsetEl = document.querySelector('p:has(.fa-moon)');
            if (sunriseEl) sunriseEl.innerHTML = `<i class="fas fa-sun mr-2"></i> Sunrise: ${data.current.formatted_sunrise || 'N/A'}`;
            if (sunsetEl) sunsetEl.innerHTML = `<i class="fas fa-moon mr-2"></i> Sunset: ${data.current.formatted_sunset || 'N/A'}`;

            // For simplicity, we'll reload the page to render the new HTML
            // A more advanced approach would use a JS templating engine
            window.location.href = `/weather?city=${encodeURIComponent(data.current.name)}`;
        }
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
        setWeatherBackground(initialWeatherCondition);
        renderFavorites();
        updateFavoriteButton();
    }
});