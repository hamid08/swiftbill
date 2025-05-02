import { Inject, Injectable, Logger } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AppException, HTTP_CONSTANT, HttpService } from 'src/common';
import { AppConfigService } from 'src/config';
import { AuthTokenResponse } from './auth.models';


@Injectable()
export class AuthServiceImp implements AuthService {
    private readonly logger = new Logger(AuthServiceImp.name);
    private accessToken: string | null = null;
    private tokenExpiration: number | null = null;
    constructor(
        @Inject(HTTP_CONSTANT.SERVICES.AUTH.SERVICE_NAME)
        private readonly httpService: HttpService,
        private readonly appConfigService: AppConfigService,
    ) { }

    /**
       * Fetches an access token using the client credentials grant type.
       * Caches the token to avoid unnecessary requests.
       */
    async getAccessToken(): Promise<string> {
        // Check if the cached token is still valid
        if (this.accessToken && this.tokenExpiration && Date.now() < this.tokenExpiration) {
            this.logger.debug('Using cached access token.');
            return this.accessToken;
        }

        // Fetch a new token
        try {
            const tokenResponse = await this.fetchTokenFromAuthServer();
            this.accessToken = tokenResponse.access_token;

            // Set token expiration (assuming the token expires in `expires_in` seconds)
            const expiresIn = tokenResponse.expires_in; // Time in seconds
            this.tokenExpiration = Date.now() + expiresIn * 1000; // Convert to milliseconds

            this.logger.debug('Successfully fetched a new access token.');
            return this.accessToken;
        } catch (error) {
            this.logger.error('Failed to fetch access token:', error);
            throw new Error('Unable to retrieve access token.');
        }
    }

    /**
     * Fetches a new access token from the authentication server.
     */
    private async fetchTokenFromAuthServer(): Promise<{
        access_token: string;
        expires_in: number;
    }> {
        const clientId = this.appConfigService.sync.clientCredentials.clientId;
        const clientSecret = this.appConfigService.sync.clientCredentials.clientSecret;
        const scope = this.appConfigService.sync.clientCredentials.clientScope;;

        if (!clientId || !clientSecret || !scope) {
            throw AppException.BadRequest('Authentication server configuration is incomplete!');
        }

        const params = new URLSearchParams();
        params.append('grant_type', 'client_credentials');
        params.append('client_id', clientId);
        params.append('client_secret', clientSecret);
        params.append('scope', scope);

        const response = await this.httpService.post<AuthTokenResponse>(
            HTTP_CONSTANT.SERVICES.AUTH.API.GET_TOKEN, params,
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );


        if (!response.data.access_token) {
            throw AppException.BadRequest('Invalid token response from authentication server.');
        }

        return {
            access_token: response.data.access_token,
            expires_in: response.data.expires_in || 300, // Default to 5 Minute if not provided
        };
    }


}
