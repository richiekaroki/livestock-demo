import { Module, OnModuleInit, Logger } from '@nestjs/common';

@Module({})
export class NewRelicModule implements OnModuleInit {
  private readonly logger = new Logger(NewRelicModule.name);

  onModuleInit() {
    if (process.env.NEW_RELIC_ENABLED === 'true') {
      this.logger.log('New Relic monitoring enabled');
    } else {
      this.logger.log('New Relic monitoring disabled');
    }
  }
}