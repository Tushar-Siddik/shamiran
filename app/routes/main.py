from flask import Blueprint, render_template, request, jsonify

main_bp = Blueprint('main', __name__)

from app.services import weather_service

@main_bp.route('/')
def index():
    """Homepage with default weather for Dhaka."""
    city = "Dhaka"
    data = weather_service.get_weather_data(city)
    return render_template('index.html', data=data, default_city=city)

@main_bp.route('/weather')
def get_weather():
    """Endpoint to get weather for a specific city via query parameter."""
    city = request.args.get('city', 'Dhaka').strip()
    if not city:
        city = "Dhaka"
    
    data = weather_service.get_weather_data(city)
    
    # If the request is an AJAX request (from our JS), return JSON
    if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
        return jsonify(data)
    
    # Otherwise, render the full page
    return render_template('index.html', data=data, default_city=city)