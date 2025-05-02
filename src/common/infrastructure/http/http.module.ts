import { DynamicModule, Module, Provider } from '@nestjs/common';
import { CustomAxiosRequestConfig, HttpService } from './http.service';
import { AppConfigService } from 'src/config';

@Module({})
export class HttpModule {
    static forFeature(options: { serviceName: string; config: (appConfigService: AppConfigService) => CustomAxiosRequestConfig }[]): DynamicModule {
        const providers: Provider[] = options.map((option) => ({
            provide: option.serviceName,
            useFactory: (appConfigService: AppConfigService) => {
                const config = option.config(appConfigService);
                return new HttpService(config);
            },
            inject: [AppConfigService],
        }));

        return {
            module: HttpModule,
            providers,
            exports: providers.map((provider) => 'provide' in provider ? provider.provide : provider),
        };
    }

    static forRoot(config: CustomAxiosRequestConfig): DynamicModule {
        const httpService = new HttpService(config);

        return {
            module: HttpModule,
            providers: [
                {
                    provide: HttpService,
                    useValue: httpService,
                },
            ],
            exports: [HttpService],
        };
    }

    static forFeatureWithProvider(options: { serviceName: string; config: (appConfigService: AppConfigService) => CustomAxiosRequestConfig }): {
        module: DynamicModule;
        provider: Provider;
    } {
        const providerName = options.serviceName;
        const provider = {
            provide: providerName,
            useFactory: (appConfigService: AppConfigService) => {
                const config = options.config(appConfigService);
                return new HttpService(config);
            },
            inject: [AppConfigService],
        };

        return {
            module: {
                module: HttpModule,
                providers: [provider],
                exports: [providerName, HttpModule],
            },
            provider,
        };
    }
}
