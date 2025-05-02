import { Inject, Injectable, Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { AppConfigService } from 'src/config';
import { GetGeoLocationAddressQuery } from './get-geo-location-address.query';
import { GeoLocationAddressResponse, NeshanReverseResponse } from './get-geo-location-address.models';
import { HTTP_CONSTANT, HttpService } from 'src/common';

@QueryHandler(GetGeoLocationAddressQuery)
export class GetGeoLocationAddressQueryHandler
    implements IQueryHandler<GetGeoLocationAddressQuery, GeoLocationAddressResponse> {

    private readonly logger = new Logger(GetGeoLocationAddressQueryHandler.name);

    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.NESHAN.SERVICE_NAME)
        private readonly httpService: HttpService,
        private readonly configService: AppConfigService,
    ) { }

    async execute(query: GetGeoLocationAddressQuery): Promise<GeoLocationAddressResponse> {
        const neshanResponse = await this.fetchFromNeshan(query.latitude, query.longitude);
        return this.mapToResponse(query.latitude, query.longitude, neshanResponse);

    }

    private async fetchFromNeshan(
        lat: number,
        lng: number
    ): Promise<NeshanReverseResponse | null> {
        try {
            const { data } = await this.httpService.get<NeshanReverseResponse>(
                HTTP_CONSTANT.SERVICES.NESHAN.API.REVERSE_GEOCODE(lat, lng),
                { headers: this.getRequestHeaders() }
            );
            return data;
        } catch (error) {
            this.logger.warn(`Neshan API request failed for [${lat},${lng}]`, {
                service: HTTP_CONSTANT.SERVICES.NESHAN.SERVICE_NAME,
                error: error.message
            });
            return null;
        }
    }

    private getRequestHeaders(): Record<string, string> {
        return {
            'Api-Key': this.configService.neshanApi.apiKey,
            'Content-Type': 'application/json'
        };
    }

    private mapToResponse(
        lat: number,
        lng: number,
        neshanResponse: NeshanReverseResponse | null
    ): GeoLocationAddressResponse {
        return {
            address: neshanResponse?.formatted_address || `${lat},${lng}`,
            latitude: lat,
            longitude: lng,
        };
    }
}