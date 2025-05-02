import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { getThemeAsync } from '@intelika/swagger-theme';
import packageJson from '../../../../package.json';

export async function setupSwagger(app: INestApplication, route: string) {
  const description = [`🍕  API documentation for the Tracking Service`];

  const configDocument = new DocumentBuilder()
    .setTitle('Tracking Service API')
    .setDescription(description.join('\r\n\r\n'))
    .setVersion(packageJson.version || '2.0.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'Bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth'
    )
    .addSecurityRequirements('JWT-auth')
    .build();

  const document = SwaggerModule.createDocument(app, configDocument);
  const style: Buffer = await getThemeAsync();
  SwaggerModule.setup(route, app, document, {
    customCss: style.toString(),
  });
}
