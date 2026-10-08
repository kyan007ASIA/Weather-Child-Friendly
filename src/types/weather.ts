export interface CurrentWeather {
  time: string;
  temperature_2m: number;
  relative_humidity_2m: number;
  apparent_temperature: number;
  is_day: number;
  precipitation: number;
  rain: number;
  showers: number;
  snowfall: number;
  weather_code: number;
  cloud_cover: number;
  wind_speed_10m: number;
  wind_direction_10m: number;
}

export interface DailyWeather {
  time: string[];
  weather_code: number[];
  temperature_2m_max: number[];
  temperature_2m_min: number[];
  apparent_temperature_max: number[];
  apparent_temperature_min: number[];
  sunrise: string[];
  sunset: string[];
  uv_index_max: number[];
  precipitation_sum: number[];
  precipitation_probability_max: number[];
  wind_speed_10m_max: number[];
}

export interface HourlyWeather {
  time: string[];
  temperature_2m: number[];
  precipitation_probability: number[];
  weather_code: number[];
}

export interface LocationInfo {
  city: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface WeatherData {
  location: LocationInfo;
  current: CurrentWeather;
  daily: DailyWeather;
  hourly: HourlyWeather;
  mcpDiagnostics?: {
    endpoint: string;
    attempted: boolean;
    mcpOk: boolean;
    mcpStatus?: number;
    mcpData?: unknown;
    toolsFound?: string[];
  };
}

export interface KidWeatherInterpretation {
  simpleTitle: string;
  tagline: string;
  mascotType: 'sunny' | 'rainy' | 'snowy' | 'cloudy';
  accentColor: string;
  bgColor: string;
  borderColor: string;
  playScore: number;
  playAdvice: string;
  clothingSuggestions: Array<{
    name: string;
    icon: string;
    importance: 'must-have' | 'good-idea' | 'optional';
  }>;
  kidFriendlyTempFeeling: string;
  scienceFunFact: string;
}
