from app.api import weather_api
from app.utils import cache
import requests

def get_weather_data(city):
    """
    Gets weather data, using a cache if available.
    For MVP, it directly calls the API.
    """
    cache_key = cache.get_cache_key(city=city)
    cached_data = cache.get_cache_data(cache_key)
    if cached_data:
        print(f"Serving from cache for city: {city}") # For debugging
        return cached_data

    print(f"Fetching from API for city: {city}") # For debugging
    try:
        current = weather_api.get_current_weather(city)
        forecast = weather_api.get_forecast(city)
        data = {
            "current": current,
            "forecast": forecast,
            "error": None
        }
        # Save the fresh data to the cache
        cache.set_cache_data(cache_key, data)
        return data
    
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return {"error": f"City '{city}' not found. Please try a major city in Bangladesh."}
        return {"error": "Could not fetch weather data. Please try again later."}
    
    except requests.exceptions.RequestException:
        return {"error": "A network error occurred. Please check your connection."}
    
def get_weather_by_coords(lat, lon):
    """Gets weather data for given coordinates."""
    cache_key = cache.get_cache_key(lat=lat, lon=lon)
    cached_data = cache.get_cache_data(cache_key)
    if cached_data:
        print(f"Serving from cache for coords: {lat}, {lon}") # For debugging
        return cached_data

    print(f"Fetching from API for coords: {lat}, {lon}") # For debugging
    try:
        current = weather_api.get_weather_by_coords(lat, lon)
        forecast = weather_api.get_forecast_by_coords(lat, lon)
        data = {
            "current": current,
            "forecast": forecast,
            "error": None
        }
        # Save the fresh data to the cache
        cache.set_cache_data(cache_key, data)
        return data
    except requests.exceptions.RequestException:
        return {"error": "Could not fetch weather for your location. Please try searching manually."}