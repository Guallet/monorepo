import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NordigenToken } from './entities/nordigen-token.entity';

@Injectable()
export class NordigenRepository {
  constructor(
    @InjectRepository(NordigenToken)
    private repository: Repository<NordigenToken>,
  ) {}

  async getToken() {
    const tokens = await this.repository.find({
      order: { id: 'DESC' },
    });

    return tokens.find(Boolean);
  }

  async createToken(
    access: string,
    access_expires: Date,
    refresh?: string,
    refresh_expires?: Date,
  ): Promise<NordigenToken> {
    return await this.repository.save({
      access: access,
      refresh: refresh,
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
    id: number,
    access: string,
    expires_on: number,
  ): Promise<NordigenToken> {
    const expiration_date = new Date();
    expiration_date.setSeconds(expiration_date.getSeconds() + expires_on);

    await this.repository.update(
      { id: id },
      {
        access: access,
        access_expires_on: expiration_date,
      },
    );

    return await this.repository.findOneBy({ id: id });
  }
}
