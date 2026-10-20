import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenToken } from './entities/nordigen-token.entity';
import { AiCredentialEncryptionService } from 'src/features/ai/ai-credential-encryption.service';

@Injectable()
export class NordigenRepository {
  constructor(
    @InjectRepository(NordigenToken)
    private repository: Repository<NordigenToken>,
    private readonly cipher: AiCredentialEncryptionService,
  ) {}

  async getToken(userId: string) {
    const token = await this.repository.findOne({ where: { user_id: userId } });
    if (!token) return null;
    return {
      ...token,
      access: this.cipher.decrypt(token.access),
      refresh: this.cipher.decrypt(token.refresh),
    };
  }

  async deleteUserToken(userId: string) {
    await this.repository.delete({ user_id: userId });
  }

  async createToken(
    userId: string,
    access: string,
    access_expires: Date,
    refresh?: string,
    refresh_expires?: Date,
  ): Promise<NordigenToken> {
    return await this.repository.save({
      user_id: userId,
      access: this.cipher.encrypt(access),
      refresh: this.cipher.encrypt(refresh ?? ''),
      access_expires_on: access_expires,
      refresh_expires_on: refresh_expires,
    });
  }

  async deleteToken(token: NordigenToken) {
    // return await this.repository.delete({
    //   where: {
    //     id: token.id,
    //   },
    // });

    await this.repository.delete({
      id: token.id,
    });
  }

  async updateToken(
    userId: string,
    id: number,
    access: string,
    expires_on: number,
  ): Promise<NordigenToken> {
    const expiration_date = new Date();
    expiration_date.setSeconds(expiration_date.getSeconds() + expires_on);

    await this.repository.update(
      { id, user_id: userId },
      {
        access: this.cipher.encrypt(access),
        access_expires_on: expiration_date,
      },
    );

    const token = await this.repository.findOneByOrFail({
      id,
      user_id: userId,
    });
    return {
      ...token,
      access: this.cipher.decrypt(token.access),
      refresh: this.cipher.decrypt(token.refresh),
    };
  }
}
