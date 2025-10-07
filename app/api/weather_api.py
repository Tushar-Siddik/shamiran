import requests
import os

API_KEY = os.environ.get('API_KEY')
BASE_URL = "http://api.openweathermap.org/data/2.5/"

def get_current_weather(city):
    """Fetches current weather data for a given city."""
    if not API_KEY:
        raise ValueError("API_KEY not set in environment variables")

    url = f"{BASE_URL}weather"
    params = {
        'q': f"{city},BD",  # Restrict search to Bangladesh
        'appid': API_KEY,
        'units': 'metric'  # For Celsius
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()

def get_forecast(city):
    """Fetches 5-day weather forecast data for a given city."""
    if not API_KEY:
        raise ValueError("API_KEY not set in environment variables")

    url = f"{BASE_URL}forecast"
    params = {
        'q': f"{city},BD",
        'appid': API_KEY,
        'units': 'metric'
    }
    response = requests.get(url, params=params)
    response.raise_for_status()
    return response.json()
