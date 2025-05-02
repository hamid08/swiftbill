import { Inject, Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from 'src/config';
import { GetWeatherDataQuery } from './get-weather-data.query';
import { WeatherDataResponse, WeatherResponseDto } from './get-weather-data.models';
import { HTTP_CONSTANT, HttpService } from 'src/common';

@Injectable()
@QueryHandler(GetWeatherDataQuery)
export class GetWeatherDataQueryHandler implements IQueryHandler<GetWeatherDataQuery, WeatherResponseDto> {
    private readonly logger = new Logger(GetWeatherDataQueryHandler.name);
    private readonly timeout = 5000; // Default timeout in ms

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.OPEN_WEATHER.SERVICE_NAME)
        private readonly httpService: HttpService,
        private readonly configService: AppConfigService,
    ) {}

    async execute(query: GetWeatherDataQuery): Promise<WeatherResponseDto> {
        try {
            const weatherResponse = await this.fetchWeatherData(query.latitude, query.longitude);
            return weatherResponse ? this.mapToWeatherDto(weatherResponse) : new WeatherResponseDto();
        } catch (error) {
            this.logger.error(`Failed to process weather data query: ${error.message}`, error.stack);
            return new WeatherResponseDto(); // Return empty response on error
        }
    }

    private async fetchWeatherData(lat: number, lng: number): Promise<WeatherDataResponse | null> {
        try {
            const url = this.buildWeatherApiUrl(lat, lng);
            const { data } = await this.httpService.get<WeatherDataResponse>(url, {
                timeout: this.timeout
            });
            return data;
        } catch (error) {
            this.handleWeatherApiError(error, lat, lng);
            return null;
        }
    }

    private buildWeatherApiUrl(lat: number, lng: number): string {
        return HTTP_CONSTANT.SERVICES.OPEN_WEATHER.API.GET_WEATHER_DATA(
            lat,
            lng,
            this.configService.openWeatherApi.token
        );
    }

    private handleWeatherApiError(error: any, lat: number, lng: number): void {
        if (error.code === 'ECONNABORTED') {
            this.logger.warn(`OpenWeather API timeout for coordinates [${lat}, ${lng}]`);
        } else {
            this.logger.warn(`OpenWeather API request failed for [${lat}, ${lng}]`, {
                service: HTTP_CONSTANT.SERVICES.OPEN_WEATHER.SERVICE_NAME,
                error: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    }

    private mapToWeatherDto(response: WeatherDataResponse): WeatherResponseDto {
        const [weatherInfo] = response.weather; // Destructure first weather item
        const iconBaseUrl = "https://openweathermap.org/img/wn/";
        
        return {
            temperature: response.main.temp,
            status: weatherInfo.description,
            icon: `${iconBaseUrl}${weatherInfo.icon}@2x.png`,
            humidity: response.main.humidity,
            locationAddress: response.name,
            windSpeed: response.wind.speed
        };
    }
}