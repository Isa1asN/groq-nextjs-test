import axios from "axios";

export async function getWeather(place) {
    console.log('Fetching weather data for:', place);
  try {
    const apiKey = process.env.NEXT_PUBLIC_OPEN_WEATHER_API_KEY;
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${place}&appid=${apiKey}&units=metric`;

    const response = await axios.get(url);
    const data = response.data;
    
    const weather = {
      location: data.name,
      temperature: data.main.temp,
      description: data.weather[0].description,
    };
    console.log('Weather data:', weather);

    return weather;
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    return { error: 'Could not retrieve weather information.' };
  }
}