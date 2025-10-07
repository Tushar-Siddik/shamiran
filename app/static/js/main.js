document.addEventListener('DOMContentLoaded', function() {
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('city-input');
    const weatherContent = document.getElementById('weather-content');
    const errorContainer = document.getElementById('error-container');
    const errorMessage = document.getElementById('error-message');

    searchForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const city = cityInput.value.trim();
        if (!city) return;

        // Show a loading state
        weatherContent.innerHTML = '<p class="text-white text-center text-xl">Loading...</p>';
        errorContainer.classList.add('hidden');

        fetch(`/weather?city=${encodeURIComponent(city)}`, {
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                // Display error
                errorMessage.textContent = data.error;
                errorContainer.classList.remove('hidden');
                weatherContent.innerHTML = ''; // Clear previous content
            } else {
                // Render new weather content
                // For simplicity, we'll just reload the page. A more advanced solution
                // would use a JS templating engine to render the new HTML.
                // For now, this is a good balance of simplicity and UX.
                window.location.href = `/weather?city=${encodeURIComponent(city)}`;
            }
        })
        .catch(error => {
            console.error('Fetch Error:', error);
            errorMessage.textContent = 'A network error occurred. Please try again.';
            errorContainer.classList.remove('hidden');
            weatherContent.innerHTML = '';
        });
    });
});