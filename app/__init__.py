from flask import Flask
from app.config import config_by_name
from datetime import datetime

def create_app(config_name='default'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # --- Custom Jinja2 Filter ---
    def format_datetime(date_string, format='%a, %b %d'):
        """Converts a date string to a datetime object and formats it."""
        # The API provides date in 'YYYY-MM-DD HH:MM:SS' format
        try:
            date_obj = datetime.strptime(date_string, '%Y-%m-%d %H:%M:%S')
            return date_obj.strftime(format)
        except (ValueError, TypeError):
            # Return the original string if parsing fails
            return date_string

    # Register the custom filter with Jinja2
    app.jinja_env.filters['strftime'] = format_datetime
    # --- End Custom Filter ---

    # Register Blueprints (routes)
    from app.routes.main import main_bp
    app.register_blueprint(main_bp)

    @app.cli.command("test")
    def test_command():
        """Runs a test command."""
        print("Shamiran is running!")

    return app