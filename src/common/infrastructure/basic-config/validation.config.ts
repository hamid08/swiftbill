import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import helmet from 'helmet';
import {
  AppExceptionFilter,
  ResponseFormatInterceptor,
} from 'src/common/application';
import { AppConfigService } from 'src/config';

export function setupValidation(
  app: INestApplication,
  configService: AppConfigService,
) {
  // =============================================
  // SECURITY MIDDLEWARE
  // =============================================

  // Helmet helps secure Express apps by setting various HTTP headers
  // Protects against well-known web vulnerabilities
  app.use(helmet());

  // =============================================
  // CORS CONFIGURATION
  // =============================================

  // Get allowed origins from configuration
  const allowedOrigins = configService.cors.allowedOrigins;

  // Enable Cross-Origin Resource Sharing (CORS)
  // - Restricts access to specified origins
  // - Allows common HTTP methods
  // - Enables credentials/cookies for cross-origin requests
  app.enableCors({
    origin: allowedOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  // =============================================
  // GLOBAL EXCEPTION HANDLING
  // =============================================

  // Register a global exception filter to handle all uncaught exceptions
  // - Provides consistent error responses
  // - Can include logging and custom error formatting
  app.useGlobalFilters(new AppExceptionFilter(configService));

  // =============================================
  // REFLECTOR & INTERCEPTORS
  // =============================================

  // Get the Reflector instance for metadata access
  const reflector = app.get(Reflector);

  // Register a global interceptor to standardize response formats
  // - Transforms all responses to a consistent structure
  // - Can handle success/error response wrapping
  app.useGlobalInterceptors(
    new ResponseFormatInterceptor(reflector)
  );

  // =============================================
  // VALIDATION PIPE CONFIGURATION (MAIN FOCUS)
  // =============================================

  // Global ValidationPipe with transformation enabled:
  // 1. Auto-converts incoming data to matching types (string → number, etc.)
  // 2. Validates incoming data against DTO definitions
  // 3. Strips out properties not defined in DTOs (when 'whitelist: true')
  // 4. Throws BadRequestException for invalid data
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,           // Auto-transform payloads to DTO instances
      whitelist: false,           // Remove non-whitelisted properties
      forbidNonWhitelisted: false, // Throw errors for non-whitelisted properties
      transformOptions: {
        enableImplicitConversion: true, // Enable implicit type conversion
      },
    })
  );
}