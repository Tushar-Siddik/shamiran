from flask import Blueprint, render_template, request, jsonify

main_bp = Blueprint('main', __name__)

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
            try:
                data['current']['formatted_sunrise'] = helpers.format_unix_timestamp(data['current']['sys']['sunrise'], data['current']['timezone'])
                data['current']['formatted_sunset'] = helpers.format_unix_timestamp(data['current']['sys']['sunset'], data['current']['timezone'])
            except (KeyError, TypeError):
                data['current']['formatted_sunrise'] = 'N/A'
                data['current']['formatted_sunset'] = 'N/A'
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