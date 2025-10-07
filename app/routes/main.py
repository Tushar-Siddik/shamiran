import requests
from flask import Blueprint, render_template, request, jsonify

main_bp = Blueprint('main', __name__)

from app.api import weather_api
from app.services import weather_service
from app.utils import helpers

@main_bp.route('/')
def index():
    """Homepage with default weather for Dhaka."""
    city = "Dhaka"
    data = weather_service.get_weather_data(city)
    # Pass the initial condition to the template
    initial_condition = data.get('current', {}).get('weather', [{}])[0].get('main', 'Clear')

    city_name_from_api = data.get('current', {}).get('name', city)

    # Format sunrise and sunset times
    sunrise_time = None
    sunset_time = None
    if data.get('current') and data.get('current').get('sys'):
        try:
            sunrise_time = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
            sunset_time = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
        except (KeyError, TypeError):
            pass # Ignore if data is missing

    return render_template('index.html', 
                           data=data, 
                        #    default_city=city,
                           default_city=city_name_from_api, 
                           initial_condition=initial_condition,
                           sunrise_time=sunrise_time,
                           sunset_time=sunset_time)

@main_bp.route('/weather')
def get_weather():
    """Endpoint to get weather for a specific city via query parameter."""
    city = request.args.get('city', 'Dhaka').strip()
    if not city:
        city = "Dhaka"
    
    data = weather_service.get_weather_data(city)
    
    # If the request is an AJAX request (from our JS), return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        # For AJAX, we also need to format the times
        if data.get('current') and data.get('current').get('sys'):
            # --- (sunrise/sunset formatting) ---
            try:
                data['current']['formatted_sunrise'] = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
                data['current']['formatted_sunset'] = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
            except (KeyError, TypeError):
                data['current']['formatted_sunrise'] = 'N/A'
                data['current']['formatted_sunset'] = 'N/A'
                
        # Add formatted alert times for AJAX
        if data.get('current') and data.get('current').get('alerts'):
            for alert in data['current']['alerts']:
                alert['formatted_start'] = helpers.format_unix_timestamp(alert['start'], data['current']['timezone'])
                alert['formatted_end'] = helpers.format_unix_timestamp(alert['end'], data['current']['timezone'])
        
        return jsonify(data)
    
    initial_condition = data.get('current', {}).get('weather', [{}])[0].get('main', 'Clear')
    
    city_name_from_api = data.get('current', {}).get('name', city)
    
    # Format sunrise and sunset for non-AJAX
    sunrise_time = None
    sunset_time = None
    if data.get('current') and data.get('current').get('sys'):
        try:
            sunrise_time = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
            sunset_time = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
        except (KeyError, TypeError):
            pass

    return render_template('index.html', 
                           data=data, 
                        #    default_city=city, 
                           default_city=city_name_from_api,
                           initial_condition=initial_condition,
                           sunrise_time=sunrise_time,
                           sunset_time=sunset_time)

@main_bp.route('/weather-by-coords')
def weather_by_coords():
    """Endpoint for getting weather via geolocation."""
    lat = request.args.get('lat')
    lon = request.args.get('lon')
    
    if not lat or not lon:
        return jsonify({"error": "Location coordinates not provided."})

    data = weather_service.get_weather_by_coords(lat, lon)
    
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        if data.get('current') and data.get('current').get('sys'):
            try:
                data['current']['formatted_sunrise'] = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
                data['current']['formatted_sunset'] = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
            except (KeyError, TypeError):
                data['current']['formatted_sunrise'] = 'N/A'
                data['current']['formatted_sunset'] = 'N/A'
                
        # Add formatted alert times for AJAX
        if data.get('current') and data.get('current').get('alerts'):
            for alert in data['current']['alerts']:
                alert['formatted_start'] = helpers.format_unix_timestamp(alert['start'], data['current']['timezone'])
                alert['formatted_end'] = helpers.format_unix_timestamp(alert['end'], data['current']['timezone'])
                
        return jsonify(data)
    
    # Fallback for non-AJAX requests
    initial_condition = data.get('current', {}).get('weather', [{}])[0].get('main', 'Clear')
    
    city_name_from_api = data.get('current', {}).get('name', 'Unknown')
    
    # Format sunrise and sunset for non-AJAX
    sunrise_time = None
    sunset_time = None
    if data.get('current') and data.get('current').get('sys'):
        try:
            sunrise_time = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
            sunset_time = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
        except (KeyError, TypeError):
            pass

    return render_template('index.html', 
                           data=data, 
                        #    default_city=data.get('current', {}).get('name', 'Unknown'),
                           default_city=city_name_from_api,
                           initial_condition=initial_condition,
                           sunrise_time=sunrise_time,
                           sunset_time=sunset_time)
    
# @main_bp.route('/api/search-suggestions')
# def search_suggestions():
#     """Provides city name suggestions for the search bar."""
#     query = request.args.get('q', '').strip()
#     if not query or len(query) < 2:
#         return jsonify([])

#     suggestions = set() # Use a set to avoid duplicates

#     # 1. Add matching favorites
#     favorites = get_favorites_from_request() # We need to create this helper
#     for fav in favorites:
#         if query.lower() in fav.lower():
#             suggestions.add(fav)

#     # 2. Add results from the Geocoding API
#     try:
#         # The weather_api.py file will need a new function
#         geo_results = weather_api.geocode_city(query)
#         for result in geo_results:
#             # Format: "City, State, Country" or "City, Country"
#             name = result.get('name', '')
#             state = result.get('state', '')
#             country = result.get('country', '')
            
#             if state:
#                 full_name = f"{name}, {state}, {country}"
#             else:
#                 full_name = f"{name}, {country}"
            
#             # We only care about cities in Bangladesh for this app
#             if country == 'BD':
#                 suggestions.add(full_name)
#     except requests.exceptions.RequestException:
#         # If the API fails, we just return the favorites we found
#         pass

#     # Convert set to a sorted list
#     return jsonify(sorted(list(suggestions)))

# # Helper function to get favorites from the request cookie
# def get_favorites_from_request():
#     # This is a bit of a hack since we don't have user sessions.
#     # For a real app, this would come from a database.
#     # For now, we can't easily access localStorage on the server.
#     # Let's modify the plan: the frontend will send favorites.
#     # This is a simpler and more robust approach.
#     pass # We'll remove this and handle it in JS.

@main_bp.route('/api/search-suggestions')
def search_suggestions():
    """Provides city name suggestions for the search bar."""
    query = request.args.get('q', '').strip()
    if not query or len(query) < 2:
        return jsonify([])

    suggestions = set()

    try:
        # We need to create the geocode_city function in weather_api.py
        geo_results = weather_api.geocode_city(query)
        for result in geo_results:
            name = result.get('name', '')
            country = result.get('country', '')
            # We only care about cities in Bangladesh
            if country == 'BD':
                suggestions.add(name) # Keep it simple, just return the city name
    except requests.exceptions.RequestException:
        pass

    return jsonify(sorted(list(suggestions)))