from datetime import datetime, timedelta

def format_unix_timestamp(ts, timezone_offset):
    """
    Converts a Unix UTC timestamp to a formatted time string, applying a timezone offset.
    This method is robust and not affected by the server's local timezone.
    """
    # 1. Create a timezone-aware UTC datetime object from the timestamp.
    utc_dt = datetime.utcfromtimestamp(ts)
    
    # 2. Apply the timezone offset (in seconds) to get the correct local time.
    local_dt = utc_dt + timedelta(seconds=timezone_offset)
    
    # 3. Format the final local time.
    return local_dt.strftime('%I:%M %p')

def format_alert_timestamp(ts, timezone_offset):
    """
    Formats a timestamp for alerts, including date and time.
    """
    utc_dt = datetime.utcfromtimestamp(ts)
    local_dt = utc_dt + timedelta(seconds=timezone_offset)
    return local_dt.strftime('%I:%M %p, %b %d')