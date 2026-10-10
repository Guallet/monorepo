import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { IsNull, QueryFailedError } from 'typeorm';
import { InstitutionsService } from './institutions.service';
import { Institution } from './entities/institution.entity';
import { Account } from '../accounts/entities/account.entity';
import { InstitutionDto } from './dto/institution.dto';
import { UpdateInstitutionRequest } from './dto/update-institution-request.dto';
import { validate } from 'class-validator';

const institution = {
  id: 'institution-1',
  user_id: 'user-1',
  name: 'Pension',
  countries: ['GB'],
  image_src: 'https://example.com/logo.png',
};

describe('InstitutionsService management', () => {
  const existsBy = vi.fn();
  const accounts = { existsBy };
  const repository = {
    find: vi.fn(),
    findOne: vi.fn(),
    save: vi.fn(),
    remove: vi.fn(),
    manager: { getRepository: vi.fn(() => accounts) },
  };
  let service: InstitutionsService;
  beforeEach(async () => {
    vi.resetAllMocks();
    repository.manager.getRepository.mockReturnValue(accounts);
    repository.findOne.mockResolvedValue({ ...institution, countries: ['GB'] });
    existsBy.mockResolvedValue(false);
    repository.remove.mockResolvedValue({ ...institution, id: undefined });
    repository.save.mockImplementation(async (value) => value);
    const module = await Test.createTestingModule({
      providers: [
        InstitutionsService,
        { provide: getRepositoryToken(Institution), useValue: repository },
      ],
    }).compile();
    service = module.get(InstitutionsService);
  });
  it('queries only the user-owned and shared institutions', async () => {
    await service.findOne({ id: institution.id, user_id: 'user-1' });
    expect(repository.findOne).toHaveBeenCalledWith({
      where: [
        { id: institution.id, user_id: 'user-1' },
        { id: institution.id, user_id: IsNull() },
      ],
    });
  });
  it('does not expose another user’s institution', async () => {
    repository.findOne.mockResolvedValue({
      ...institution,
      user_id: 'another-user',
    });
    await expect(
      service.remove({ id: institution.id, user_id: 'user-1' }),
    ).rejects.toBeInstanceOf(NotFoundException);
    expect(existsBy).not.toHaveBeenCalled();
    expect(repository.remove).not.toHaveBeenCalled();
  });
  it('forbids editing and deleting shared institutions', async () => {
    repository.findOne.mockResolvedValue({ ...institution, user_id: null });
    await expect(
      service.remove({ id: institution.id, user_id: 'user-1' }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    await expect(
      service.update({
        id: institution.id,
        user_id: 'user-1',
        dto: { name: 'Changed' },
      }),
    ).rejects.toBeInstanceOf(ForbiddenException);
    expect(repository.remove).not.toHaveBeenCalled();
    expect(repository.save).not.toHaveBeenCalled();
  });
  it('returns conflict for an institution with accounts, using a user-scoped check', async () => {
    existsBy.mockResolvedValue(true);
    await expect(
      service.remove({ id: institution.id, user_id: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(repository.manager.getRepository).toHaveBeenCalledWith(Account);
    expect(existsBy).toHaveBeenCalledWith({
      institutionId: institution.id,
      user_id: 'user-1',
    });
    expect(repository.remove).not.toHaveBeenCalled();
  });
  it('preserves the deleted id in the response', async () => {
    const deleted = await service.remove({
      id: institution.id,
      user_id: 'user-1',
    });
    expect(deleted.id).toBe(institution.id);
  });
  it('converts a foreign-key race to conflict instead of deleting accounts', async () => {
    repository.remove.mockRejectedValue(
      new QueryFailedError(
        'DELETE',
        [],
        Object.assign(new Error('foreign key violation'), { code: '23503' }),
      ),
    );
    await expect(
      service.remove({ id: institution.id, user_id: 'user-1' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });
  it('does not hide unrelated database errors', async () => {
    const failure = new Error('Database unavailable');
    repository.remove.mockRejectedValue(failure);
    await expect(
      service.remove({ id: institution.id, user_id: 'user-1' }),
    ).rejects.toBe(failure);
  });
  it('clears a logo explicitly and adds countries without duplicates', async () => {
    const updated = await service.update({
      id: institution.id,
      user_id: 'user-1',
      dto: { image_src: null, country: 'GB' },
    });
    expect(updated.image_src).toBeNull();
    expect(updated.countries).toEqual(['GB']);
    expect(updated.name).toBe('Pension');
  });
  it('adds a country when the legacy countries value is null', async () => {
    repository.findOne.mockResolvedValue({ ...institution, countries: null });
    const updated = await service.update({
      id: institution.id,
      user_id: 'user-1',
      dto: { country: 'IE' },
    });
    expect(updated.countries).toEqual(['IE']);
  });
});

describe('Institution contract', () => {
  it('exposes ownership and countries for the mobile management list', () => {
    expect(
      InstitutionDto.fromDomain(Object.assign(new Institution(), institution)),
    ).toMatchObject({ user_id: 'user-1', countries: ['GB'] });
    expect(
      InstitutionDto.fromDomain(
        Object.assign(new Institution(), {
          id: 'shared',
          name: 'Bank',
          user_id: null,
          countries: null,
        }),
      ),
    ).toMatchObject({ user_id: null, countries: [] });
  });
  it('accepts an explicit logo removal and rejects invalid image links', async () => {
    expect(
      await validate(
        Object.assign(new UpdateInstitutionRequest(), { image_src: null }),
      ),
    ).toEqual([]);
    expect(
      await validate(
        Object.assign(new UpdateInstitutionRequest(), {
          image_src: 'not a URL',
        }),
      ),
    ).not.toEqual([]);
  });
});
