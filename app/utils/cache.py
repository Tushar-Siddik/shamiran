import json
import os
import time
from flask import current_app

CACHE_DIR = 'cache'
os.makedirs(CACHE_DIR, exist_ok=True)

def get_cache_key(lat=None, lon=None, city=None):
    """Generates a unique cache key based on location."""
    if lat and lon:
        return f"coords_{lat}_{lon}.json"
    if city:
        # Sanitize city name for file system
        safe_city = "".join(c for c in city if c.isalnum() or c in (' ', '_')).rstrip()
        return f"city_{safe_city}.json"
    return None

def get_cache_data(cache_key):
    """Retrieves data from cache if it's still valid."""
    if not cache_key:
        return None
    
    cache_path = os.path.join(CACHE_DIR, cache_key)
    try:
        with open(cache_path, 'r') as f:
            cached_data = json.load(f)
        
        # Check if the cache is expired (e.g., 10 minutes)
        cache_timeout = current_app.config.get('CACHE_TIMEOUT', 600) # 10 minutes default
        if time.time() - cached_data['timestamp'] < cache_timeout:
            return cached_data['data']
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        pass
    
    return None

def set_cache_data(cache_key, data):
    """Saves data to the cache file."""
    if not cache_key:
        return
    
    cache_path = os.path.join(CACHE_DIR, cache_key)
    cache_content = {
        'timestamp': time.time(),
        'data': data
    }
    try:
        with open(cache_path, 'w') as f:
            json.dump(cache_content, f)
    except IOError:
        # Failed to write cache, but we don't want to crash the app
        pass