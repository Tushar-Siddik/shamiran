# Shamiran

![Python Version](https://img.shields.io/badge/python-3.8+-blue.svg)
![Flask Version](https://img.shields.io/badge/flask-2.0+-green.svg)
![License](https://img.shields.io/badge/license-MIT-purple.svg)

A modern, responsive, and feature-rich weather application built with Flask, tailored specifically for cities in Bangladesh. Shamiran provides real-time weather data, detailed forecasts, and advanced atmospheric insights through a clean and intuitive user interface.

### The name Shamiran, সমীরণ in bangla spelling, means gentle breeze.

## Table of Contents

- [Features](#features)
- [Demo](#demo)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Key Setup](#api-key-setup)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)

## Features

### 🌤️ Core Features
- **Real-Time Weather Data**: Get current temperature, humidity, wind speed, "feels like" temperature, and weather conditions for any city in Bangladesh.
- **Geolocation Support**: Automatically detects the user's location to provide instant local weather updates.
- **City Search**: A powerful search bar with auto-suggestions and debouncing for finding cities quickly.
- **Hourly Forecast**: View a detailed, hour-by-hour forecast for the next 15 hours.
- **Weather Alerts**: Displays official weather alerts and warnings directly from the API when available.

### 📊 Advanced Features
- **Air Quality Index (AQI)**: Displays the current AQI level, PM2.5 concentration, and health recommendations.
- **UV Index**: Provides the current UV index with corresponding health advice for sun exposure.
- **Moon Phases**: Shows the current moon phase, moonrise/moonset times, and calculates the date of the next phase.
- **Interactive Weather Map**: An integrated map using Leaflet.js and OpenStreetMap, with an optional precipitation radar layer from OpenWeatherMap.
- **Favorites System**: Save frequently accessed cities to a favorites list for quick retrieval, persisted in localStorage.

### 🎨 UI/UX Features
- **Dynamic Theming**: The application's background and UI elements change dynamically based on the current weather condition (e.g., rain animations for rainy weather).
- **Dark/Light Mode**: A user-controlled toggle to switch between light and dark themes, independent of the weather theme.
- **Responsive Design**: Fully responsive layout that works seamlessly on desktop, tablet, and mobile devices.
- **Weather Animations**: Subtle, performant CSS animations for rain, snow, clouds, and lightning enhance the user experience.
- **Modern UI**: Built with Tailwind CSS for a clean, modern, and maintainable design.

## Demo

## 📸 Screenshots

### 🧭 Home Page (light mode)

<img src="images\screenshots\homepage_lightmode.png" alt="Home Page (light mode)" width="600"/>
<img src="images\screenshots\homepage_lightmode1.png" alt="Home Page (light mode)" width="600"/>

### 🌙 Dark Mode Enabled

<img src="images\screenshots\homepage_darkmode.png" alt="Home Page (dark mode)" width="600"/>

### 🗺️ Map enabled

<img src="images\screenshots\map_after_toggle.png" alt="Home Page (dark mode)" width="600"/>

### 🗺️ Favorite places

<img src="images\screenshots\added_favorite.png" alt="Home Page (dark mode)" width="600"/>


The application features a glassmorphic design with a dynamic background that reflects the current weather. Users can interact with the search bar, use geolocation, toggle between light and dark modes, and view detailed information on cards that are both informative and visually appealing.

## Tech Stack

| Component | Technology |
| --- | --- |
| **Backend** | Python, Flask |
| **Frontend** | HTML5, Tailwind CSS, Vanilla JavaScript |
| **APIs** | [OpenWeatherMap](https://openweathermap.org/api) |
| **Mapping** | [Leaflet.js](https://leafletjs.com/), [OpenStreetMap](https://www.openstreetmap.org/) |
| **Icons** | [Font Awesome](https://fontawesome.com/) |
| **Other Libraries** | [Astral](https://astral.readthedocs.io/) (for moon phase calculations) |

## Prerequisites

- Python 3.8 or higher
- `pip` (Python package installer)
- An API key from [OpenWeatherMap](https://openweathermap.org/api)

## Installation

Follow these steps to set up the project locally:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/shamiran.git
    cd shamiran
    ```

2.  **Create and activate a virtual environment:**
    ```bash
    # For Unix/macOS
    python3 -m venv venv
    source venv/bin/activate

    # For Windows
    python -m venv venv
    .\venv\Scripts\activate
    ```

3.  **Install the required dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create a `.env` file** in the root directory and add your API keys (see [Configuration](#configuration)).

5.  **Run the application:**
    ```bash
    python run.py
    ```

The application will be available at `http://127.0.0.1:5000`.

## Configuration

The application relies on environment variables for configuration. Create a file named `.env` in the project root and add the following variables:

```
API_KEY=your_openweathermap_api_key_here
SECRET_KEY=a_very_secret_random_string_for_flask
```

-   `API_KEY`: Your personal API key from OpenWeatherMap. This is required for the app to function.
-   `SECRET_KEY`: A secret key for Flask session management. Generate a secure, random string for this.

## Usage

Once the application is running:

1.  **Default View**: The homepage will display the weather for Dhaka by default.
2.  **Search for a City**: Type the name of any city in Bangladesh into the search bar. Suggestions will appear as you type.
3.  **Use Geolocation**: Click the "My Location" button to get weather for your current position.
4.  **Manage Favorites**: Click the star icon next to the city name to add or remove it from your favorites list in the sidebar.
5.  **View Details**: Scroll down to see the hourly forecast, AQI/UV Index, and moon phase information.
6.  **Toggle Map**: Click the map icon to reveal an interactive weather map for the selected location.
7.  **Toggle Theme**: Use the switch in the header to toggle between light and dark modes.

## API Key Setup

1.  Sign up for a free account on [OpenWeatherMap](https://home.openweathermap.org/users/sign_up).
2.  Navigate to the "API keys" tab in your account dashboard.
3.  An API key will be generated for you by default. Copy this key.
4.  Paste the key into the `.env` file as described in the [Configuration](#configuration) section.

## Project Structure

```
Shamiran
├── LICENSE
├── README.md
├── app
│   ├── __init__.py
│   ├── api
│   │   ├── __init__.py
│   │   └── weather_api.py
│   ├── config.py
│   ├── models
│   │   └── __init__.py
│   ├── routes
│   │   ├── __init__.py
│   │   └── main.py
│   ├── services
│   │   ├── __init__.py
│   │   └── weather_service.py
│   ├── static
│   │   ├── css
│   │   │   └── darkmode.css
│   │   └── js
│   │       └── main.js
│   ├── templates
│   │   ├── base.html
│   │   └── index.html
│   └── utils
│       ├── __init__.py
│       ├── cache.py
│       ├── helpers.py
│       └── moon_phase.py
├── requirements.txt
└── run.py
```

## Contributing

Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## License

This project is licensed under the terms of the `LICENSE` file in this repository.

## Acknowledgements

-   [OpenWeatherMap](https://openweathermap.org/) for providing the comprehensive weather data API.
-   [Leaflet.js](https://leafletjs.com/) and [OpenStreetMap](https://www.openstreetmap.org/) for the mapping functionality.
-   [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework.
-   [Font Awesome](https://fontawesome.com/) for the high-quality icons.
-   [Astral](https://astral.readthedocs.io/) for the moon phase calculation library.