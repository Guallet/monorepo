import { UserRole } from 'src/auth/user-principal';
import { BaseDbEntity } from 'src/database/BaseDbEntity';
import { Column, Entity, PrimaryColumn } from 'typeorm';

// We need to ensure the database fields name match the ones in the better auth user configuration
@Entity('users')
export class User extends BaseDbEntity {
  // @PrimaryColumn('uuid', {
  //   name: 'id',
  // })
  // Needs to be typed as text to match better auth user id type
  @PrimaryColumn('text', {
    name: 'id',
  })
  id: string;

  @Column({
    name: 'name',
    nullable: false,
  })
  name: string;

  @Column({
    name: 'email',
    nullable: false,
  })
  email: string;

  @Column({
    name: 'email_verified',
    default: false,
    nullable: false,
  })
  email_verified: boolean;

  @Column({
    name: 'profile_image_url',
    nullable: true,
  })
  profile_image_url: string;

  @Column({
    // type: 'set',
    type: 'simple-array',
    default: '',
    nullable: true,
  })
  roles: UserRole[];

  // user settings
  @Column({
    nullable: true,
  })
  default_currency: string;

  @Column({
    type: 'simple-array',
    default: '',
    nullable: true,
  })
  preferred_currencies: string[];

  @Column({
    nullable: true,
  })
  // preferred date format for the user, one of: MM/DD/YYYY, DD/MM/YYYY, YYYY/MM/DD
  date_format: string;

  // relations
}
