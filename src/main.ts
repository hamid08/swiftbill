import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import * as semver from 'semver';
import packageJson from '../package.json';
import { AppModule } from './app.module';
import { AppConfigService } from './config';
import { APPLICATION_CONSTANT, setupSwagger, setupValidation } from './common';
import { NestExpressApplication } from '@nestjs/platform-express';

console.log(
  `🚀 Welcome to the Swift Bill Api (Version: ${packageJson.version}) 🚀\n` +
  `✨ A product by Payever Company (${new Date().getFullYear()}) ✨`,
);

// Check Node.js version compatibility
function checkNodeVersion() {
  const nodeVersion = process.version;
  const requiredNodeVersions = packageJson.engines.node;
  const bannedNodeVersions = packageJson.engines.bannedNode;

  // Exit if the Node.js version is banned
  if (semver.satisfies(nodeVersion, bannedNodeVersions)) {
    console.error(
      `Error: Node.js version ${nodeVersion} is not supported. Please upgrade to ${requiredNodeVersions}.`,
    );
    process.exit(1);
  }

  // Warn if the Node.js version is unsupported but may still work
  if (!semver.satisfies(nodeVersion, requiredNodeVersions)) {
    console.warn(
      `Warning: Node.js version ${nodeVersion} is not officially supported. Please upgrade to ${requiredNodeVersions}.`,
    );
  }
}

async function bootstrap() {
  checkNodeVersion();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const appConfig: AppConfigService = app.get(AppConfigService);
  const applicationPort: number = appConfig.application.port;

  // Setup Swagger in development mode
  if (appConfig.application.nodeEnv === APPLICATION_CONSTANT.ENVIRONMENT.IS_DEVELOPMENT) {
    await setupSwagger(app, 'swagger');

    // Redirect root path to Swagger documentation
    app.use((req, res, next) => {
      if (req.path === '/') {
        res.redirect('/swagger');
      } else {
        next();
      }
    });
  }

  setupValidation(app, appConfig);

  await app.listen(applicationPort);
  Logger.log(`Application is running on port ${applicationPort}`, 'Main');
}

bootstrap();
