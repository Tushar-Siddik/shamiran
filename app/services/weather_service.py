from app.api import weather_api
from app.utils import cache, moon_phase
import requests

# Helper to get AQI description and color
def get_aqi_info(aqi_value):
    aqi_data = {
        1: {"level": "Good", "color": "bg-green-500"},
        2: {"level": "Fair", "color": "bg-lime-500"},
        3: {"level": "Moderate", "color": "bg-yellow-500"},
        4: {"level": "Poor", "color": "bg-orange-500"},
        5: {"level": "Very Poor", "color": "bg-red-600"},
    }
    return aqi_data.get(aqi_value, {"level": "Unknown", "color": "bg-gray-500"})

# Helper function for PM2.5 classification
def get_pm25_info(pm25_value):
    """Classifies PM2.5 value into a health level."""
    if pm25_value is None:
        return {"level": "N/A", "color": "bg-gray-500"}
    
    # Based on US EPA AQI breakpoints for PM2.5 (µg/m³)
    if pm25_value <= 12.0:
        return {"level": "Good", "color": "bg-green-500"}
    elif pm25_value <= 35.4:
        return {"level": "Moderate", "color": "bg-yellow-500"}
    elif pm25_value <= 55.4:
        return {"level": "Unhealthy for Sensitive", "color": "bg-orange-500"}
    elif pm25_value <= 150.4:
        return {"level": "Unhealthy", "color": "bg-red-500"}
    elif pm25_value <= 250.4:
        return {"level": "Very Unhealthy", "color": "bg-purple-600"}
    else:
        return {"level": "Hazardous", "color": "bg-red-900"}

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
        
        # lat = current['coord']['lat']
        # lon = current['coord']['lon']
        coord = current.get('coord', {})
        lat = coord.get('lat')
        lon = coord.get('lon') 
        
        # --- Moon Phase Integration ---
        moon_data = None
        try:
            moon_data = moon_phase.get_moon_phase_data(current['name'], lat, lon, current['timezone'])
        except Exception:
            moon_data = None # Fail silently if moon data is not available
        # --- End Moon Phase Integration ---
        
        # # --- DEBUGGING: PRINT THE RAW API RESPONSE ---
        # print("--- RAW API RESPONSE FOR CURRENT WEATHER ---")
        # import json
        # print(json.dumps(current, indent=2)) # Pretty-print the JSON
        # print("--------------------------------------------")
        # # --- END DEBUGGING ---

        # # --- UV Index Integration ---
        # uvi = current.get('uvi')
        # print(f"--- Extracted UVI: {uvi} ---") # Also print what we extracted
        # # --- End UV Index Integration ---
        
        
        # --- UV Index Integration ---
        uvi = None
        try:
            # Get coordinates from the current weather response
            # lat = current['coord']['lat']
            # lon = current['coord']['lon']
            uvi_response = weather_api.get_uv_index(lat, lon)
            uvi = uvi_response.get('value')
        except (KeyError, requests.exceptions.RequestException):
            # Fail silently if UV Index data is not available
            pass
        # --- End UV Index Integration ---
        
        # --- AQI Integration ---
        aqi_data = None
        try:
            # Get coordinates from the current weather response
            # lat = current['coord']['lat']
            # lon = current['coord']['lon']
            pollution_response = weather_api.get_air_pollution(lat, lon)
            
            # Get main AQI
            aqi_value = pollution_response['list'][0]['main']['aqi']
            
            # Get PM2.5 value and its classification
            pm25_value = pollution_response['list'][0]['components'].get('pm2_5')
            pm25_info = get_pm25_info(pm25_value)
            
            aqi_data = {
                "value": aqi_value,
                "info": get_aqi_info(aqi_value),
                "pm25": {
                    "value": pm25_value,
                    "info": pm25_info
                }
            }
            
        except (KeyError, IndexError, requests.exceptions.RequestException):
            aqi_data = None # Fail silently if AQI data is not available
        # --- End AQI Integration ---
        
        data = {
            "current": current,
            "forecast": forecast,
            "aqi": aqi_data,
            "uvi": uvi,
            "moon": moon_data,
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
        
        # --- Moon Phase Integration ---
        moon_data = None
        try:
            moon_data = moon_phase.get_moon_phase_data(current['name'], lat, lon, current['timezone'])
        except Exception:
            moon_data = None
        # --- End Moon Phase Integration ---
        
        # --- UV Index Integration ---
        uvi = None
        try:
            uvi_response = weather_api.get_uv_index(lat, lon)
            uvi = uvi_response.get('value')
        except (KeyError, requests.exceptions.RequestException):
            pass
        # --- End UV Index Integration ---
        
        # --- AQI Integration ---
        aqi_data = None
        try:
            pollution_response = weather_api.get_air_pollution(lat, lon)
            
            # Get main AQI
            aqi_value = pollution_response['list'][0]['main']['aqi']
            
            # Get PM2.5 value and its classification
            pm25_value = pollution_response['list'][0]['components'].get('pm2_5')
            pm25_info = get_pm25_info(pm25_value)
            
            aqi_data = {
                "value": aqi_value,
                "info": get_aqi_info(aqi_value),
                "pm25": {
                    "value": pm25_value,
                    "info": pm25_info
                }
            }
            
        except (KeyError, IndexError, requests.exceptions.RequestException):
            aqi_data = None
        # --- End AQI Integration ---

        data = {
            "current": current,
            "forecast": forecast,
            "aqi": aqi_data,
            "uvi": uvi,
            "moon": moon_data,
            "error": None
        }
        # Save the fresh data to the cache
        cache.set_cache_data(cache_key, data)
        return data
    except requests.exceptions.RequestException:
        return {"error": "Could not fetch weather for your location. Please try searching manually."}