import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Account } from 'src/features/accounts/entities/account.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('institutions')
export class Institution extends BaseDbEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  image_src?: string;

  // If this is not null, it's because the user created this manually. We need a UI to manage this from the user app
  @Column({ nullable: true })
  user_id?: string;

  // THIS IS BECAUSE NORDIGEN OPEN BANKING
  @Column({ nullable: true, unique: true })
  nordigen_id: string;

  @Column('simple-array', { nullable: true })
  countries: string[];

  // relations
  @OneToMany(() => Account, (account) => account.institution)
  accounts: Account[];
}
