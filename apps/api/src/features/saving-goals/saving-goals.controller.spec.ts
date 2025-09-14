import { Test, TestingModule } from '@nestjs/testing';
import { SavingGoalsController } from './saving-goals.controller';
import { SavingGoalsService } from './saving-goals.service';

describe('SavingGoalsController', () => {
  let controller: SavingGoalsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SavingGoalsController],
      providers: [SavingGoalsService],
    }).compile();

    controller = module.get<SavingGoalsController>(SavingGoalsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
