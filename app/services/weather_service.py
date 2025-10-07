from app.api import weather_api
import requests

def get_weather_data(city):
    """
    Gets weather data, using a cache if available.
    For MVP, it directly calls the API.
    """
    try:
        current = weather_api.get_current_weather(city)
        forecast = weather_api.get_forecast(city)
        return {
            "current": current,
            "forecast": forecast,
            "error": None
        }
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 404:
            return {"error": f"City '{city}' not found. Please try a major city in Bangladesh."}
        return {"error": "Could not fetch weather data. Please try again later."}
    except requests.exceptions.RequestException:
        return {"error": "A network error occurred. Please check your connection."}
    
def get_weather_by_coords(lat, lon):
    """Gets weather data for given coordinates."""
    try:
        current = weather_api.get_weather_by_coords(lat, lon)
        forecast = weather_api.get_forecast_by_coords(lat, lon)
        return {
            "current": current,
            "forecast": forecast,
            "error": None
        }
    except requests.exceptions.RequestException:
        return {"error": "Could not fetch weather for your location. Please try searching manually."}