from datetime import datetime

def format_unix_timestamp(ts, timezone_offset):
    """Converts a Unix timestamp to a formatted time string (HH:MM AM/PM)."""
    # The API provides a timezone offset in seconds. We need to add it to the timestamp.
    local_timestamp = ts + timezone_offset
    return datetime.fromtimestamp(local_timestamp).strftime('%I:%M %p')