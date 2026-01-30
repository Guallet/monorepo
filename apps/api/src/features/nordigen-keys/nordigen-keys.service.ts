import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { NordigenKey } from './entities/nordigen-key.entity';
import { NordigenKeyAccount } from './entities/nordigen-key-account.entity';
import {
  CreateNordigenKeyRequest,
  UpdateNordigenKeyRequest,
} from './dto/nordigen-key.dto';
import { Account } from '../accounts/entities/account.entity';
import { NordigenUserService } from '../nordigen/nordigen-user.service';

@Injectable()
export class NordigenKeysService {
  private readonly logger = new Logger(NordigenKeysService.name);

  constructor(
    @InjectRepository(NordigenKey)
    private readonly keyRepository: Repository<NordigenKey>,
    @InjectRepository(NordigenKeyAccount)
    private readonly keyAccountRepository: Repository<NordigenKeyAccount>,
    @InjectRepository(Account)
    private readonly accountRepository: Repository<Account>,
    private readonly nordigenUserService: NordigenUserService,
  ) { }

  async findAllByUser(userId: string): Promise<NordigenKey[]> {
    return this.keyRepository.find({
      where: { user_id: userId },
      relations: ['linkedAccounts'],
    });
  }

  async findById(userId: string, keyId: string): Promise<NordigenKey> {
    const key = await this.keyRepository.findOne({
      where: { id: keyId, user_id: userId },
      relations: ['linkedAccounts'],
    });
    if (!key) {
      throw new NotFoundException('Nordigen key not found');
    }
    return key;
  }

  /**
   * Validates Nordigen credentials by attempting to get an access token.
   * @throws UnauthorizedException if credentials are invalid
   */
  private async validateCredentials(
    secretId: string,
    secretKey: string,
  ): Promise<void> {
    try {
      await this.nordigenUserService.getAccessToken({
        secretId,
        secretKey,
      });
      this.logger.log('Nordigen credentials validated successfully');
    } catch (error) {
      this.logger.error('Failed to validate Nordigen credentials', error);
      throw new BadRequestException(
        'Invalid Nordigen credentials. Please check your Secret ID and Secret Key.',
      );
    }
  }

  async create(
    userId: string,
    dto: CreateNordigenKeyRequest,
  ): Promise<NordigenKey> {
    // Validate credentials before saving
    await this.validateCredentials(dto.secret_id, dto.secret_key);

    const key = this.keyRepository.create({
      user_id: userId,
      name: dto.name,
      secret_id: dto.secret_id,
      secret_key: dto.secret_key,
    });

    const savedKey = await this.keyRepository.save(key);

    // Link accounts if provided
    if (dto.account_ids && dto.account_ids.length > 0) {
      await this.linkAccounts(userId, savedKey.id, dto.account_ids);
    }

    return this.findById(userId, savedKey.id);
  }

  async update(
    userId: string,
    keyId: string,
    dto: UpdateNordigenKeyRequest,
  ): Promise<NordigenKey> {
    const key = await this.findById(userId, keyId);

    // If credentials are being updated, validate them first
    if (dto.secret_id !== undefined || dto.secret_key !== undefined) {
      const newSecretId = dto.secret_id ?? key.secret_id;
      const newSecretKey = dto.secret_key ?? key.secret_key;
      await this.validateCredentials(newSecretId, newSecretKey);
    }

    if (dto.name !== undefined) {
      key.name = dto.name;
    }
    if (dto.secret_id !== undefined) {
      key.secret_id = dto.secret_id;
    }
    if (dto.secret_key !== undefined) {
      key.secret_key = dto.secret_key;
    }

    await this.keyRepository.save(key);
    return this.findById(userId, keyId);
  }

  async delete(userId: string, keyId: string): Promise<NordigenKey> {
    const key = await this.findById(userId, keyId);
    await this.keyRepository.remove(key);
    return key;
  }

  async linkAccounts(
    userId: string,
    keyId: string,
    accountIds: string[],
  ): Promise<NordigenKey> {
    const key = await this.findById(userId, keyId);

    // Verify all accounts belong to the user
    const accounts = await this.accountRepository.find({
      where: { id: In(accountIds), user_id: userId },
    });

    if (accounts.length !== accountIds.length) {
      throw new BadRequestException(
        'Some accounts do not exist or do not belong to you',
      );
    }

    // Remove existing links for these accounts (an account can only be linked to one key)
    await this.keyAccountRepository.delete({
      account_id: In(accountIds),
    });

    // Create new links
    const keyAccounts = accountIds.map((accountId) =>
      this.keyAccountRepository.create({
        nordigen_key_id: key.id,
        account_id: accountId,
      }),
    );
    await this.keyAccountRepository.save(keyAccounts);

    return this.findById(userId, keyId);
  }

  async unlinkAccounts(
    userId: string,
    keyId: string,
    accountIds: string[],
  ): Promise<NordigenKey> {
    await this.findById(userId, keyId);

    await this.keyAccountRepository.delete({
      nordigen_key_id: keyId,
      account_id: In(accountIds),
    });

    return this.findById(userId, keyId);
  }

  async findKeyForAccount(accountId: string): Promise<NordigenKey | null> {
    const keyAccount = await this.keyAccountRepository.findOne({
      where: { account_id: accountId },
      relations: ['nordigenKey'],
    });
    return keyAccount?.nordigenKey || null;
  }

  async findAllKeysWithAccounts(): Promise<NordigenKey[]> {
    return this.keyRepository
      .createQueryBuilder('key')
      .innerJoinAndSelect('key.linkedAccounts', 'linkedAccounts')
      .getMany();
  }

  async findKeyWithAccountsById(keyId: string): Promise<NordigenKey | null> {
    return this.keyRepository.findOne({
      where: { id: keyId },
      relations: ['linkedAccounts'],
    });
  }

  async updateSyncStatus(
    keyId: string,
    success: boolean,
    errorMessage?: string,
  ): Promise<void> {
    const update: Partial<NordigenKey> = {
      last_sync_at: new Date(),
    };

    if (!success && errorMessage) {
      update.last_error_at = new Date();
      update.last_error_message = errorMessage;
    }

    await this.keyRepository.update(keyId, update);
  }
}
