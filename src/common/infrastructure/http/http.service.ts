import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Injectable } from '@nestjs/common';

export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
    enableLogging?: boolean;
    defaultTimeout?: number;
    rejectUnauthorized?: boolean;
}

@Injectable()
export class HttpService {
    private axiosInstance: AxiosInstance;
    private defaultTimeout: number;

    constructor(private readonly options: CustomAxiosRequestConfig) {
        const { enableLogging, defaultTimeout = 5000, rejectUnauthorized, ...config } = options;
        this.defaultTimeout = defaultTimeout;

        // Create HTTPS agent if certificate verification should be disabled
        const httpsAgent = rejectUnauthorized === false
            ? new (require('https').Agent)({ rejectUnauthorized: false })
            : undefined;

            this.axiosInstance = axios.create({
                ...config,
                timeout: defaultTimeout,
                httpsAgent: httpsAgent
            });

        if (enableLogging) {
            this.axiosInstance.interceptors.request.use(this.handleRequest);
            this.axiosInstance.interceptors.response.use(this.handleResponse, this.handleErrorResponse);
        }
    }

    private handleRequest(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
        return config;
    }

    private handleResponse(response: AxiosResponse): AxiosResponse {
        return response;
    }

    private handleErrorResponse(error: AxiosError): Promise<AxiosError> {
        return Promise.reject(error);
    }

    async get<T>(url: string, config?: AxiosRequestConfig & { timeout?: number }): Promise<AxiosResponse<T>> {
        const finalConfig = {
            ...config,
            timeout: config?.timeout ?? this.defaultTimeout
        };
        return this.axiosInstance.get<T>(url, finalConfig);
    }

    async post<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const response: AxiosResponse<T> = await this.axiosInstance.post(url, data, config);
        return response;
    }

    async put<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const response: AxiosResponse<T> = await this.axiosInstance.put(url, data, config);
        return response;
    }

    async patch<T>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const response: AxiosResponse<T> = await this.axiosInstance.patch(url, data, config);
        return response;
    }

    async delete<T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
        const response: AxiosResponse<T> = await this.axiosInstance.delete(url, config);
        return response;
    }
}