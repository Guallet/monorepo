import { Test, TestingModule } from '@nestjs/testing';
import { InstitutionsResolver } from './institutions.resolver';
import { InstitutionsService } from './institutions.service';

describe('InstitutionsResolver', () => {
  let resolver: InstitutionsResolver;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InstitutionsResolver, InstitutionsService],
    }).compile();

    resolver = module.get<InstitutionsResolver>(InstitutionsResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });
});
