document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const weatherContent = document.getElementById('weather-content');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');
    const appBody = document.getElementById('app-body');

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

            // For simplicity, we'll reload the page to render the new HTML
            // A more advanced approach would use a JS templating engine
            window.location.href = `/weather?city=${encodeURIComponent(data.current.name)}`;
        }
    }

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
    }
});