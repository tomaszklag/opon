import { Module } from '@nestjs/common';
import { ProvidersModule } from '../providers/providers.module';
import { PricingTiersController } from './pricing-tiers.controller';
import { PricingTiersRepository } from './pricing-tiers.repository';
import { PricingTiersService } from './pricing-tiers.service';

@Module({
  imports: [ProvidersModule],
  controllers: [PricingTiersController],
  providers: [PricingTiersService, PricingTiersRepository],
  exports: [PricingTiersService],
})
export class PricingTiersModule {}
