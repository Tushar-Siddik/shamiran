from datetime import datetime, date, timedelta
from astral import moon
from astral import LocationInfo

def _get_phase_details(phase_number):
    """A helper function to map a phase number to a name and emoji."""
    if phase_number < 1.84:
        return "New Moon", "🌑"
    elif phase_number < 5.53:
        return "Waxing Crescent", "🌒"
    elif phase_number < 9.22:
        return "First Quarter", "🌓"
    elif phase_number < 12.91:
        return "Waxing Gibbous", "🌔"
    elif phase_number < 16.61:
        return "Full Moon", "🌕"
    elif phase_number < 20.30:
        return "Waning Gibbous", "🌖"
    elif phase_number < 23.99:
        return "Last Quarter", "🌗"
    else:
        return "Waning Crescent", "🌘"

def get_moon_phase_data(city_name, lat, lon, timezone_offset):
    """
    Calculates moon phase, moonrise, and moonset for a given location.
    """
    try:
        # Create a location object for the city
        location = LocationInfo(city_name, "Bangladesh", "Asia/Dhaka", lat, lon)
        today_date = date.today()

        # 1. Get current phase
        phase_number = moon.phase(today_date)
        current_phase_name, current_phase_emoji = _get_phase_details(phase_number)
        phase_class = current_phase_name.lower().replace(' ', '-')

        # 2. Get moonrise and moonset
        # The observer object is needed for these calculations
        observer = location.observer
        rise_time_utc = moon.moonrise(observer, date=today_date)
        set_time_utc = moon.moonset(observer, date=today_date)

        # 3. Format times
        def format_time(dt_utc):
            if dt_utc is None:
                return "N/A"
            # Adjust UTC time to local time using the timezone offset
            local_dt = dt_utc + timedelta(seconds=timezone_offset)
            return local_dt.strftime('%I:%M %p')

        moonrise_formatted = format_time(rise_time_utc)
        moonset_formatted = format_time(set_time_utc)

        # 4. Find next phase
        next_phase_date = None
        next_phase_name = None
        for i in range(1, 31):
            future_date = today_date + timedelta(days=i)
            future_phase_name, _ = _get_phase_details(moon.phase(future_date))
            if future_phase_name != current_phase_name:
                next_phase_date = future_date
                next_phase_name = future_phase_name
                break
        
        return {
            "moonrise": moonrise_formatted,
            "moonset": moonset_formatted,
            "current_phase_name": current_phase_name,
            "current_phase_emoji": current_phase_emoji,
            "current_phase_class": phase_class,
            "next_phase_date": next_phase_date.strftime('%B %d') if next_phase_date else "N/A",
            "next_phase_name": next_phase_name or "N/A",
        }

    except Exception as e:
        print(f"Error calculating moon phase: {e}")
        return None