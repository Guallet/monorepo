import { Test, TestingModule } from '@nestjs/testing';
import { NordigenController } from './nordigen.controller.js';
import { NordigenService } from './nordigen.service.js';

describe('NordigenController', () => {
  let controller: NordigenController;

  const mockNordigenService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NordigenController],
      providers: [
        {
          provide: NordigenService,
          useValue: mockNordigenService,
        },
      ],
    }).compile();

    controller = module.get<NordigenController>(NordigenController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // Note: This controller has no endpoints defined, so no additional tests are needed
  // If endpoints are added in the future, tests should be added here
});
