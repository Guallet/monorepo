import { UserRole } from 'src/auth/user-principal';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class User extends BaseDbEntity {
  // This is the same ID as the one returned by the Auth Provider (Supabase at this time)
  @PrimaryColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  profile_image_url: string;

  @Column({
    // type: 'set',
    type: 'simple-array',
    default: '',
    nullable: true,
  })
  roles: UserRole[];

  // user settings
  @Column({ nullable: true })
  default_currency: string;

  @Column({
    type: 'simple-array',
    default: '',
    nullable: true,
  })
  preferred_currencies: string[];

  @Column({ nullable: true })
  // preferred date format for the user, one of: MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD
  date_format: string;

  // relations
}
