export class WeatherResponseDto {
    temperature: number;
    status: string;
    icon: string;
    locationAddress: string;
    windSpeed: number;
    humidity: number;
}

export class WeatherDataResponse {
    coord: WeatherDataCoord;
    weather: WeatherDataWeather[];
    base: string;
    main: WeatherDataMain;
    visibility: number;
    wind: WeatherDataWind;
    clouds: WeatherDataClouds;
    dt: number;
    sys: WeatherDataSys;
    timezone: number;
    id: number;
    name: string;
    cod: number;
}

export class WeatherDataCoord {
    lon: number;
    lat: number;
}

export class WeatherDataSys {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
}

export class WeatherDataClouds {
    all: number;
}

export class WeatherDataWind {
    speed: number;
    deg: number;
}

export class WeatherDataMain {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
}

export class WeatherDataWeather {
    id: number;
    main: string;
    description: string;
    icon: string;
}
