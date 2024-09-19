import { Test, TestingModule } from '@nestjs/testing';

import { DeliveriesController } from './delivery.controller';
import { DeliveryService } from './delivery.service';

describe('DeliveriesController', () => {
  let controller: DeliveriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DeliveriesController],
      providers: [DeliveryService],
    }).compile();

    controller = module.get<DeliveriesController>(DeliveriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
