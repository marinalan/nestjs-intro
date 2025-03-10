import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { config } from 'aws-sdk';

export function appCreate(app: INestApplication): void {
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJs Masterclass - Blog app API')
    .setDescription('Use the base API URL as http://localhost:3000')
    .setTermsOfService('http://localhost:3000/terms-of-service')
    .setLicense(
      'MIT License',
      'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
    )
    .addServer('http://localhost:3000/')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Setup the aws sdk used uploading the files to aws s3 bucket
  const configService = app.get(ConfigService);
  config.update({
    credentials: {
      accessKeyId: configService.get<string>('appConfig.awsAccessKeyId'),
      secretAccessKey: configService.get<string>(
        'appConfig.awsSecretAccessKey',
      ),
    },
    region: configService.get<string>('appConfig.awsRegion'),
  });

  app.enableCors();
}
