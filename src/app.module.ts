import { ConfigModule } from '@nestjs/config';
import { LoggerProvider } from './common/log';
import { Module } from '@nestjs/common';
import env from './config/env';

@Module({
  imports: [ConfigModule.forRoot({ envFilePath: '../.env', isGlobal: true, load: [env] })],
  providers: [LoggerProvider()],
})
export class AppModule {}
